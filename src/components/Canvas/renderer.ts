import * as d3 from 'd3';
import type { AlgorithmStep, PointerState } from '../../types';
import { POINTER_COLORS, POINTER_LABELS, STAGE_TITLES } from './constants';
import { createCanvasLayout } from './layout';
import { motionDuration } from './motion';
import { fadeOutAndRemove } from './fadeOutAndRemove';
import { appendWrappedText, formatValue, getPointerValues, getRelationText } from './renderHelpers';
import type { CanvasDimensions, CanvasGroupSelection, CanvasLayout } from './types';
import { createVisibleFrame, getVisibleArrayRange, visibleFocusIndices } from './virtualArray';
import type { CanvasTransform } from './virtualArray';

const EXIT_DURATION = motionDuration('exit', 1, typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export function renderCanvas(
  g: CanvasGroupSelection,
  currentStep: AlgorithmStep,
  dimensions: CanvasDimensions,
  playbackSpeed = 1,
  transform: CanvasTransform = { x: 0, k: 1 }
) {
  g.selectAll<SVGGElement, unknown>('*').interrupt();
  g.selectAll('.canvas-exit').interrupt('exit').remove();

  const layout = createCanvasLayout(currentStep, dimensions);
  const { arrayState, pointers, result, description, variables, decision } = currentStep;
  const range = getVisibleArrayRange(arrayState.length, dimensions.width, transform, layout.nodesX, layout.cellWidth + layout.gap);
  const visibleNodes = createVisibleFrame(arrayState, range, visibleFocusIndices(currentStep));
  const visibleStep = { ...currentStep, arrayState: visibleNodes };
  const updateDuration = motionDuration('move', playbackSpeed, typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const decisionPointers = decision?.previousPointers ?? pointers;

  const layers = ensureLayers(g);
  const scene = layers.containers.selectAll<SVGGElement, string>('.canvas-scene').data(['scene']).join('g').attr('class', 'canvas-scene');
  scene.attr('transform', arrayState.length > 80 ? 'translate(0,140)' : 'translate(0,0)');
  const sceneLayers = ensureLayers(scene);
  drawGrid(sceneLayers.containers, layout, dimensions.width);
  drawStage(layers.labels, layout, description, currentStep, dimensions.width);

  const arrayGroup = sceneLayers.nodes.selectAll<SVGGElement, string>('.array-group').data(['array']).join('g').attr('class', 'array-group');
  arrayGroup.selectAll<SVGTextElement, string>('.array-title').data(['title']).join('text')
    .attr('x', layout.nodesX).attr('y', layout.arrayTop - 82).attr('class', 'section-title array-title').text('排序后的数组');
  arrayGroup.selectAll<SVGTextElement, string>('.array-subtitle').data(['subtitle']).join('text')
    .attr('x', layout.nodesX).attr('y', layout.arrayTop - 64).attr('class', 'array-subtitle')
    .text('格子下方是排序下标；“原”标记保留输入位置');

  drawSearchWindow(arrayGroup, pointers, layout);
  drawDecisionConnectors(sceneLayers.edges, pointers, layout);
  drawMetrics(layers.labels, layout, currentStep, arrayState.length);

  arrayGroup.selectAll<SVGGElement, AlgorithmStep['arrayState'][number]>('.array-cell-group')
    .data(visibleNodes, item => `array-${item.originalIndex}`)
    .join(
      enter => enter.append('g').attr('class', 'array-cell-group').attr('opacity', 0),
      update => update,
      exit => { fadeOutAndRemove(exit, EXIT_DURATION); return exit; }
    )
    .each(function updateCell(item) {
      const x = layout.nodesX + item.index * (layout.cellWidth + layout.gap);
      drawArrayCell(d3.select(this), item, item.index, x, layout, visibleStep, updateDuration);
    });

  drawPointers(arrayGroup, pointers, layout, decision?.movedPointer, updateDuration);
  drawMovement(sceneLayers.arrows, decision?.movedPointer, decision?.previousPointers, pointers, layout, updateDuration);
  drawSkipMarkers(arrayGroup, currentStep, layout);
  drawDecisionPanel(layers.labels, layout, currentStep, decisionPointers);
  drawVariables(layers.labels, layout, variables);
  drawResults(layers.labels, layout, result);
}

function ensureLayers(g: CanvasGroupSelection) {
  const layer = (name: string) => g.selectAll<SVGGElement, string>(`.layer-${name}`).data([name]).join('g').attr('class', `layer-${name}`);
  return {
    containers: layer('containers'),
    edges: layer('edges'),
    arrows: layer('arrows'),
    nodes: layer('nodes'),
    labels: layer('labels')
  };
}

function drawGrid(g: CanvasGroupSelection, layout: CanvasLayout, viewportWidth: number) {
  const width = Math.max(viewportWidth, layout.contentStartX + layout.contentWidth + 24);
  const height = layout.contentHeight;
  const vertical = d3.range(0, width + 1, 24).map(value => ({ id: `x-${value}`, value }));
  const horizontal = d3.range(0, height + 1, 24).map(value => ({ id: `y-${value}`, value }));
  const grid = g.selectAll<SVGGElement, string>('.canvas-grid').data(['grid']).join('g').attr('class', 'canvas-grid');

  grid.selectAll<SVGLineElement, typeof vertical[number]>('.grid-vertical').data(vertical, item => item.id).join('line')
    .attr('class', 'grid-vertical').attr('x1', item => item.value).attr('x2', item => item.value).attr('y1', 0).attr('y2', height);
  grid.selectAll<SVGLineElement, typeof horizontal[number]>('.grid-horizontal').data(horizontal, item => item.id).join('line')
    .attr('class', 'grid-horizontal').attr('x1', 0).attr('x2', width).attr('y1', item => item.value).attr('y2', item => item.value);
}

function drawMetrics(g: CanvasGroupSelection, layout: CanvasLayout, step: AlgorithmStep, nodeCount: number) {
  const metrics = [
    { id: 'nodes', label: '元素', value: String(nodeCount) },
    { id: 'focus', label: '焦点', value: step.animationType === 'compare' ? '双指针比较' : step.operation === 'done' ? '完成' : '单步' },
    { id: 'answers', label: '解', value: String(step.result.length) }
  ];
  const row = g.selectAll<SVGGElement, string>('.canvas-metrics').data(['metrics']).join('g').attr('class', 'canvas-metrics').attr('aria-label', '画布指标')
    .attr('transform', `translate(${layout.contentStartX},${layout.contentHeight - 28})`);
  row.selectAll<SVGGElement, typeof metrics[number]>('.canvas-metric').data(metrics, metric => metric.id).join('g')
    .attr('class', 'canvas-metric')
    .attr('transform', (_, index) => `translate(${index * 104},0)` )
    .each(function renderMetric(metric) {
      const group = d3.select(this);
      group.selectAll<SVGTextElement, string>('text.metric-label').data(['label']).join('text')
        .attr('class', 'metric-label').attr('y', 0).text(metric.label);
      group.selectAll<SVGTextElement, string>('text.metric-value').data([metric.value]).join('text')
        .attr('class', 'metric-value').attr('x', 34).attr('y', 0).text(value => value);
    });
}

function drawStage(
  g: CanvasGroupSelection,
  layout: CanvasLayout,
  description: string,
  step: AlgorithmStep,
  viewportWidth: number
) {
  const panel = g.selectAll<SVGGElement, string>('.stage-panel').data(['stage']).join('g')
    .attr('class', `stage-panel ${step.animationType}`)
    .attr('data-operation', step.operation)
    .attr('data-step-id', step.id);
  panel.interrupt().attr('opacity', 1).attr('transform', 'translate(0,0)');
  panel.selectAll<SVGRectElement, string>('rect.stage-panel-bg').data(['background']).join('rect')
    .attr('x', layout.contentStartX)
    .attr('y', layout.stageY)
    .attr('width', Math.min(layout.stageWidth, viewportWidth - layout.contentStartX * 2))
    .attr('height', layout.stageHeight)
    .attr('rx', 8)
    .attr('class', 'stage-panel-bg');

  panel.selectAll<SVGRectElement, string>('rect.stage-accent').data(['accent']).join('rect')
    .attr('x', layout.contentStartX)
    .attr('y', layout.stageY)
    .attr('width', 5)
    .attr('height', layout.stageHeight)
    .attr('rx', 3)
    .attr('class', `stage-accent ${step.decision?.relation ?? step.animationType}`);

  panel.selectAll<SVGTextElement, string>('text.stage-kicker').data(['title']).join('text')
    .attr('x', layout.contentStartX + 18).attr('y', layout.stageY + (layout.mobile ? 26 : 28)).attr('class', 'stage-kicker').text(STAGE_TITLES[step.animationType]);
  panel.selectAll<SVGTextElement, string>('text.operation-badge').data(['operation']).join('text')
    .attr('x', layout.contentStartX + (layout.mobile ? 96 : 18)).attr('y', layout.stageY + (layout.mobile ? 28 : 48)).attr('class', 'operation-badge').text(step.operation);

  const relation = step.decision?.relation;
  panel.selectAll<SVGTextElement, NonNullable<typeof relation>>('text.relation-badge')
    .data(relation && !layout.mobile ? [relation] : []).join('text')
    .attr('x', layout.contentStartX + 18).attr('y', layout.stageY + 68)
    .attr('class', value => `relation-badge ${value}`).text(value => getRelationText(value));

  const narration = step.narration || description;
  const wrappedNarration = appendWrappedText(panel, narration, layout.narrationX, layout.narrationY,
    layout.narrationWidth, 16, 'step-description');
  wrappedNarration.selectAll<SVGTSpanElement, string>('tspan').attr('dy', (_, index) => index === 0 ? 0 : 18);
  if (Number(wrappedNarration.attr('data-line-count')) > 1) panel.select('text.stage-kicker').attr('y', layout.stageY + 24);

  panel.selectAll<SVGTextElement, string>('text.data-flow-guide').data(['guide']).join('text')
    .attr('x', layout.mobile ? layout.contentStartX + 18 : layout.contentStartX + 118)
    .attr('y', layout.mobile ? layout.stageY + 116 : layout.stageY + 84)
    .attr('class', 'data-flow-guide')
    .text(layout.mobile ? '流程：排序 → 固定 i → 比较 → 移动指针' : '数据流：原数组 → 排序 → 固定 i → 比较 left + right → 移动指针');
}

function drawSearchWindow(g: CanvasGroupSelection, pointers: PointerState, layout: CanvasLayout) {
  if (pointers.left < 0 || pointers.right < 0 || pointers.left > pointers.right) {
    g.selectAll<SVGGElement, string>('.search-window-group').data([]).join('g');
    return;
  }

  const x = layout.nodesX + pointers.left * (layout.cellWidth + layout.gap) - layout.gap / 2;
  const width = (pointers.right - pointers.left + 1) * layout.cellWidth
    + (pointers.right - pointers.left) * layout.gap
    + layout.gap;

  const windowGroup = g.selectAll<SVGGElement, string>('.search-window-group').data(['window']).join('g').attr('class', 'search-window-group');

  windowGroup.selectAll<SVGRectElement, string>('.search-window').data(['window']).join('rect')
    .attr('x', x)
    .attr('y', layout.arrayY - 10)
    .attr('width', width)
    .attr('height', layout.cellHeight + 20)
    .attr('rx', 8)
    .attr('class', 'search-window')
    .attr('opacity', 1);

  windowGroup.selectAll<SVGTextElement, string>('.window-label').data(['label']).join('text')
    .attr('x', x + width / 2)
    .attr('y', layout.arrayY - 14)
    .attr('class', 'window-label')
    .text(`搜索范围 ${pointers.left}–${pointers.right}`);
}

function drawDecisionConnectors(g: CanvasGroupSelection, pointers: PointerState, layout: CanvasLayout) {
  if (pointers.i < 0 || pointers.left < 0 || pointers.right < 0) {
    g.selectAll<SVGGElement, string>('.sum-flow').data([]).join('g');
    g.selectAll<SVGTextElement, string>('.sum-total-label').data([]).join('text');
    return;
  }

  const centers = [pointers.i, pointers.left, pointers.right].map(index =>
    layout.nodesX + index * (layout.cellWidth + layout.gap) + layout.cellWidth / 2
  );
  const top = layout.arrowY;
  const arrowEnd = top + 38;
  const flows = [
    { id: 'i', x: centers[0], label: 'i 固定' },
    { id: 'left', x: centers[1], label: 'left 候选' },
    { id: 'right', x: centers[2], label: 'right 候选' }
  ];

  g.selectAll<SVGGElement, typeof flows[number]>('.sum-flow').data(flows, flow => flow.id).join('g')
    .attr('class', flow => `sum-flow sum-flow--${flow.id}`)
    .each(function drawFlow(flowData) {
      const flow = d3.select(this);
      const badgeWidth = flowData.label.length * 6.4 + 12;
      flow.selectAll<SVGPathElement, string>('path.sum-connector').data(['path']).join('path')
        .attr('class', 'sum-connector')
        .attr('d', `M${flowData.x},${top} L${flowData.x},${arrowEnd}`)
        .attr('marker-end', 'url(#sum-flow-arrow)');
      flow.selectAll<SVGRectElement, string>('rect.sum-flow-badge').data(['badge']).join('rect')
        .attr('x', flowData.x - badgeWidth / 2).attr('y', arrowEnd + 7)
        .attr('width', badgeWidth).attr('height', 18).attr('rx', 8)
        .attr('class', 'sum-flow-badge');
      flow.selectAll<SVGTextElement, string>('text.sum-connector-label').data([flowData.label]).join('text')
        .attr('x', flowData.x).attr('y', arrowEnd + 20).attr('class', 'sum-connector-label')
        .text(value => value);
    });

  g.selectAll<SVGTextElement, string>('.sum-total-label').data(['sum']).join('text')
    .attr('x', (centers[0] + centers[2]) / 2)
    .attr('y', arrowEnd + 48)
    .attr('class', 'sum-total-label')
    .text('三项相加后与 0 比较');
}

function getNodeStatus(item: AlgorithmStep['arrayState'][number], step: AlgorithmStep) {
  const { pointers, decision, animationType, result } = step;
  if (animationType === 'compare' && (item.index === pointers.left || item.index === pointers.right)) return 'compare';
  if (animationType === 'found' && item.highlight === 'found') return 'done';
  if (animationType === 'complete' && result.some(triplet => triplet.includes(item.value))) return 'done';
  if (animationType === 'move-i' && item.index === pointers.i) return 'current';
  const movedPointer = decision?.movedPointer;
  if (animationType === 'skip' || animationType === 'move-left' || animationType === 'move-right') {
    if (movedPointer === 'i' && item.index === pointers.i) return 'current';
    if (movedPointer === 'left' && item.index === pointers.left) return 'current';
    if (movedPointer === 'right' && item.index === pointers.right) return 'current';
    if (movedPointer === 'both' && (item.index === pointers.left || item.index === pointers.right)) return 'current';
    const previous = decision?.previousPointers;
    if (previous && ((movedPointer === 'i' && item.index === previous.i) || (movedPointer === 'left' && item.index === previous.left) || (movedPointer === 'right' && item.index === previous.right) || (movedPointer === 'both' && (item.index === previous.left || item.index === previous.right)))) return 'visited';
  }
  return 'idle';
}

function drawArrayCell(
  g: CanvasGroupSelection,
  item: AlgorithmStep['arrayState'][number],
  idx: number,
  x: number,
  layout: CanvasLayout,
  step: AlgorithmStep,
  updateDuration: number
) {
  const { animationType } = step;
  const nodeStatus = getNodeStatus(item, step);
  const status = item.highlight === 'none' && idx === 0 && (animationType === 'init' || animationType === 'sort') ? 'current' : nodeStatus;
  const cell = g.attr('class', `array-cell-group ${item.highlight}`)
    .attr('data-node-id', `array-${item.originalIndex}`)
    .attr('data-status', status);
  if (updateDuration === 0) {
    cell.interrupt('move').attr('transform', `translate(${x},${layout.arrayY})`).attr('opacity', 1);
  } else {
    cell.interrupt('move').transition('move').duration(updateDuration).ease(d3.easeCubicOut)
      .attr('transform', `translate(${x},${layout.arrayY})`).attr('opacity', 1);
  }
  cell.selectAll<SVGRectElement, string>('rect.array-cell').data(['cell']).join('rect')
    .attr('width', layout.cellWidth).attr('height', layout.cellHeight).attr('rx', 6).attr('class', `array-cell ${item.highlight}`);
  cell.selectAll<SVGTextElement, string>('text.node-status').data(['status']).join('text')
    .attr('class', 'node-status').attr('x', layout.cellWidth / 2).attr('y', -8)
    .text(status === 'visited' ? '已排除' : status === 'done' ? '答案' : '');
  const showAllLabels = step.arrayState.length <= 80;
  const showFocusedLabel = status === 'current' || status === 'compare' || status === 'done';
  const showValue = showAllLabels || showFocusedLabel;
  cell.selectAll<SVGTextElement, string>('text.cell-value').data(showValue ? ['value'] : []).join('text')
    .attr('x', layout.cellWidth / 2).attr('y', Math.min(21, layout.cellHeight * 0.52)).attr('class', 'cell-value').text(showValue ? item.value : '');
  cell.selectAll<SVGTextElement, string>('text.cell-index').data(showAllLabels ? ['index'] : []).join('text')
    .attr('x', layout.cellWidth / 2).attr('y', layout.cellHeight + 16).attr('class', 'cell-index').text(idx);
  cell.selectAll<SVGTextElement, string>('text.cell-origin').data(showAllLabels && layout.cellWidth >= 42 ? ['origin'] : []).join('text')
    .attr('x', layout.cellWidth / 2).attr('y', 38).attr('class', 'cell-origin').text(`原${item.originalIndex}`);

  if (animationType === 'found' && item.highlight === 'found') {
    cell.select<SVGRectElement>('rect.array-cell').attr('transform', `translate(${layout.cellWidth * -0.04},${layout.cellHeight * -0.04}) scale(1.08)`);
  } else {
    cell.select<SVGRectElement>('rect.array-cell').attr('transform', null);
  }
}

function drawPointers(
  g: CanvasGroupSelection,
  pointers: PointerState,
  layout: CanvasLayout,
  movedPointer: NonNullable<AlgorithmStep['decision']>['movedPointer'] | undefined,
  updateDuration: number
) {
  drawPointer(g, pointers.i, layout.arrayY - 20, layout, 'i', movedPointer === 'i', updateDuration);
  drawPointer(g, pointers.left, layout.arrayY - 48, layout, 'left', movedPointer === 'left' || movedPointer === 'both', updateDuration);
  drawPointer(g, pointers.right, layout.arrayY - 48, layout, 'right', movedPointer === 'right' || movedPointer === 'both', updateDuration);
}

function drawPointer(
  g: CanvasGroupSelection,
  index: number,
  y: number,
  layout: CanvasLayout,
  key: keyof PointerState,
  active: boolean,
  updateDuration: number
) {
  const color = POINTER_COLORS[key];
  const pointerX = layout.nodesX + index * (layout.cellWidth + layout.gap) + layout.cellWidth / 2;
  const pointerGroup = g.selectAll<SVGGElement, string>(`.pointer.${key}`).data(index >= 0 ? [key] : []).join(enter => enter.append('g'), update => update, exit => exit.remove())
    .attr('class', `pointer ${key} ${active ? 'moving' : ''}`);
  if (index < 0) return;
  pointerGroup.interrupt('move');
  if (updateDuration === 0) {
    pointerGroup.attr('transform', `translate(${pointerX},0)`);
  } else {
    pointerGroup.transition('move').duration(updateDuration).ease(d3.easeCubicOut).attr('transform', `translate(${pointerX},0)`);
  }

  pointerGroup.selectAll<SVGLineElement, string>('line.pointer-line').data(['pointer']).join('line')
    .attr('class', 'pointer-line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', y + 18)
    .attr('y2', y + 43)
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '3 3');

  pointerGroup.selectAll<SVGPathElement, string>('path.pointer-arrow').data(['arrow']).join('path')
    .attr('class', 'pointer-arrow')
    .attr('d', `M0,${y + 48} L-7,${y + 36} L7,${y + 36} Z`)
    .attr('fill', color);

  pointerGroup.selectAll<SVGRectElement, string>('rect.pointer-badge').data(['badge']).join('rect')
    .attr('class', 'pointer-badge')
    .attr('x', -22).attr('y', y).attr('width', 44).attr('height', 20).attr('rx', 5).attr('fill', color);

  pointerGroup.selectAll<SVGTextElement, string>('text.pointer-label').data(['label']).join('text')
    .attr('x', 0).attr('y', y + 14).attr('class', 'pointer-label').text(POINTER_LABELS[key]);
}

function clearMovement(g: CanvasGroupSelection, key?: 'left' | 'right') {
  const selector = key ? `.move-line.${key}, .move-origin.${key}, .move-arrow.${key}, .move-label.${key}` : '.move-line, .move-origin, .move-arrow, .move-label';
  g.selectAll(selector).each(function removeMovement() { d3.select(this).interrupt('move').remove(); });
}

function drawMovement(
  g: CanvasGroupSelection,
  movedPointer: NonNullable<AlgorithmStep['decision']>['movedPointer'],
  previous: PointerState | undefined,
  current: PointerState,
  layout: CanvasLayout,
  transitionDuration: number
) {
  if (!movedPointer || !previous) {
    clearMovement(g);
    return;
  }

  const pointerKeys: Array<keyof PointerState> = movedPointer === 'both' ? ['left', 'right'] : [movedPointer];
  const activeKeys = new Set(pointerKeys);
  for (const key of ['left', 'right'] as const) {
    if (!activeKeys.has(key)) clearMovement(g, key);
  }

  pointerKeys.forEach((key, idx) => {
    const from = previous[key];
    const to = current[key];
    if (from < 0 || to < 0 || from === to) return;

    const x1 = layout.nodesX + from * (layout.cellWidth + layout.gap) + layout.cellWidth / 2;
    const x2 = layout.nodesX + to * (layout.cellWidth + layout.gap) + layout.cellWidth / 2;
    const y = layout.arrayY + 78 + idx * 20;
    const color = key === 'right' ? POINTER_COLORS.right : POINTER_COLORS.left;
    const path = g.selectAll<SVGPathElement, string>(`.move-line.${key}`).data([key]).join('path')
      .attr('d', `M${x1},${y} C${(x1 + x2) / 2},${y - 18} ${(x1 + x2) / 2},${y + 18} ${x2},${y}`)
      .attr('class', `move-line ${key}`)
      .attr('stroke', color)
      .attr('stroke-dashoffset', 0);

    path.transition('move').duration(transitionDuration).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

    g.selectAll<SVGCircleElement, string>(`.move-origin.${key}`).data([key]).join('circle')
      .attr('cx', x1)
      .attr('cy', y)
      .attr('r', 4)
      .attr('class', 'move-origin')
      .attr('fill', color);

    g.selectAll<SVGPathElement, string>(`.move-arrow.${key}`).data([key]).join('path')
      .attr('d', x2 > x1
        ? `M${x2},${y} L${x2 - 8},${y - 5} L${x2 - 8},${y + 5} Z`
        : `M${x2},${y} L${x2 + 8},${y - 5} L${x2 + 8},${y + 5} Z`)
      .attr('class', `move-arrow ${key}`)
      .attr('fill', color)
      .attr('opacity', 1);

    g.selectAll<SVGTextElement, string>(`.move-label.${key}`).data([key]).join('text')
      .attr('x', (x1 + x2) / 2)
      .attr('y', y - 8)
      .attr('class', `move-label ${key}`)
      .text(`${POINTER_LABELS[key]}: ${from} -> ${to}`);
  });
}

function drawSkipMarkers(g: CanvasGroupSelection, step: AlgorithmStep, layout: CanvasLayout) {
  const markers = step.animationType === 'skip' ? step.arrayState.filter(item => item.highlight === 'skip') : [];
  g.selectAll<SVGGElement, AlgorithmStep['arrayState'][number]>('.skip-marker').data(markers, item => `skip-${item.originalIndex}`).join('g')
    .attr('class', 'skip-marker')
    .attr('transform', item => `translate(${layout.nodesX + item.index * (layout.cellWidth + layout.gap)},${layout.arrayY})`)
    .each(function drawMarker() {
      const marker = d3.select(this);
      marker.selectAll<SVGLineElement, string>('line').data(['a', 'b']).join('line')
        .attr('x1', (_, idx) => idx === 0 ? 8 : layout.cellWidth - 8)
        .attr('x2', (_, idx) => idx === 0 ? layout.cellWidth - 8 : 8)
        .attr('y1', 8).attr('y2', layout.cellHeight - 8);
    });
}

function drawDecisionPanel(
  g: CanvasGroupSelection,
  layout: CanvasLayout,
  step: AlgorithmStep,
  pointers: PointerState
) {
  const panelWidth = layout.panelWidth;
  const panelX = layout.panelX;
  const panelY = layout.detailY;
  const panelInset = 14;
  const panel = g.selectAll<SVGGElement, string>('.decision-panel').data(['decision']).join('g')
    .attr('class', 'info-panel decision-panel').attr('opacity', 1);
  panel.selectAll('rect.info-panel-bg').data(['background']).join('rect')
    .attr('x', panelX)
    .attr('y', panelY)
    .attr('width', panelWidth)
    .attr('height', 108)
    .attr('rx', 8)
    .attr('class', 'info-panel-bg');

  panel.selectAll<SVGTextElement, string>('text.section-title').data(['title']).join('text')
    .attr('x', panelX + panelInset).attr('y', panelY + 24).attr('class', 'section-title').text('当前三数之和');

  const values = getPointerValues(step, pointers);
  const sum = step.decision?.sum ?? values.sum;
  const formulaText = values.valid
    ? `${values.i} + ${values.left} + ${values.right} = ${sum}`
    : '等待进入双指针扫描';

  panel.selectAll<SVGTextElement, string>('text.formula-text').data([formulaText]).join('text')
    .attr('x', panelX + panelInset).attr('y', panelY + 52).attr('class', 'formula-text').text(value => value);

  const target = step.decision?.target;
  panel.selectAll<SVGTextElement, number>('text.target-text').data(target === undefined ? [] : [target]).join('text')
    .attr('x', panelX + panelInset).attr('y', panelY + 78).attr('class', 'target-text')
    .text(value => `目标：left + right = ${value}`);
  panel.selectAll<SVGTextElement, string>('text.decision-explanation').data([step.narration || step.description]).join('text')
    .attr('x', panelX + panelInset).attr('y', panelY + 98).attr('class', 'decision-explanation')
    .text(value => value);
  const relation = step.decision?.relation;
  panel.selectAll<SVGTextElement, NonNullable<typeof relation>>('text.relation-pill').data(relation ? [relation] : []).join('text')
    .attr('x', panelX + panelWidth - 84).attr('y', panelY + 53)
    .attr('class', value => `relation-pill ${value}`).text(value => getRelationText(value));
}

function drawVariables(
  g: CanvasGroupSelection,
  layout: CanvasLayout,
  variables: AlgorithmStep['variables']
) {
  const panelY = layout.variablesY;
  const panel = g.selectAll<SVGGElement, string>('.vars-panel').data(['variables']).join('g')
    .attr('class', 'info-panel vars-panel').attr('opacity', 1);
  panel.selectAll<SVGRectElement, string>('rect.info-panel-bg').data(['background']).join('rect')
    .attr('x', layout.variablesX).attr('y', panelY).attr('width', 322).attr('height', 108).attr('rx', 8).attr('class', 'info-panel-bg');
  panel.selectAll<SVGTextElement, string>('text.section-title').data(['title']).join('text')
    .attr('x', layout.variablesX + 14).attr('y', panelY + 24).attr('class', 'section-title').text('变量状态');

  const visibleVars = variables.slice(0, 3);
  panel.selectAll<SVGTextElement, typeof visibleVars[number]>('text.var-text').data(visibleVars, variable => variable.name).join('text')
    .attr('x', (_, idx) => layout.variablesX + 14 + (idx % 2) * 150)
    .attr('y', (_, idx) => panelY + 50 + Math.floor(idx / 2) * 24)
    .attr('class', variable => `var-text ${variable.highlight ? 'highlight' : ''}`)
    .text(variable => `${variable.name}: ${formatValue(variable.value)}`);
}

function drawResults(
  g: CanvasGroupSelection,
  layout: CanvasLayout,
  result: number[][]
) {
  const panel = g.selectAll<SVGGElement, string>('.result-group').data(['results']).join('g').attr('class', 'result-group');
  panel.selectAll<SVGTextElement, string>('text.result-title').data(['title']).join('text')
    .attr('x', layout.resultsX)
    .attr('y', layout.resultY)
    .attr('class', 'section-title result-title')
    .text(`已找到三元组：${result.length} 组`);

  if (result.length === 0) {
    panel.selectAll<SVGTextElement, string>('text.empty-result').data(['empty']).join('text')
      .attr('x', layout.resultsX).attr('y', layout.resultY + 30).attr('class', 'empty-result')
      .text('暂无命中，继续移动指针搜索');
    panel.selectAll('.triplet-chip').remove();
    return;
  }

  panel.selectAll<SVGTextElement, string>('text.empty-result').remove();
  const tripletWidth = 150;
  const columns = layout.resultColumns;
  panel.selectAll<SVGGElement, number[]>('.triplet-chip').data(result, triplet => triplet.join(',')).join(
    enter => enter.append('g').attr('class', 'triplet-chip'),
    update => update,
    exit => { fadeOutAndRemove(exit, EXIT_DURATION); return exit; }
  ).each(function updateTriplet(triplet, idx) {
    const col = idx % columns;
    const row = Math.floor(idx / columns);
    const tripletX = layout.resultsX + col * (tripletWidth + 14);
    const tripletY = layout.resultY + 20 + row * 36;
    const group = d3.select(this).attr('opacity', 1);
    group.selectAll<SVGRectElement, string>('rect').data(['card']).join('rect')
      .attr('x', tripletX).attr('y', tripletY).attr('width', tripletWidth).attr('height', 28).attr('rx', 6)
      .attr('class', idx === result.length - 1 ? 'triplet-bg latest' : 'triplet-bg');
    group.selectAll<SVGTextElement, number[]>('text').data([triplet]).join('text')
      .attr('x', tripletX + tripletWidth / 2).attr('y', tripletY + 18).attr('class', 'triplet-text')
      .text(value => `[${value.join(', ')}]`);
  });
}
