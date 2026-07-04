import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep, PointerState } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
}

const POINTER_COLORS = {
  i: '#2563eb',
  left: '#059669',
  right: '#d97706'
};

const POINTER_LABELS = {
  i: 'i',
  left: 'left',
  right: 'right'
};

export function Canvas({ currentStep }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('.canvas-content');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.55, 2.6])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(16, 18));
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    if (!currentStep || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('.canvas-content');
    g.selectAll('*').remove();

    const { arrayState, pointers, result, description, variables, decision, animationType } = currentStep;
    const decisionPointers = decision?.previousPointers ?? pointers;

    const gap = 6;
    const cellWidth = getCellWidth(arrayState.length);
    const cellHeight = 48;
    const startX = 32;
    const stageY = 20;
    const arrayY = 154;
    const arrayWidth = arrayState.length * cellWidth + Math.max(0, arrayState.length - 1) * gap;
    const contentWidth = Math.max(760, arrayWidth + 64);

    drawStage(g, startX, stageY, contentWidth, description, currentStep);
    drawLegend(g, startX + contentWidth - 318, stageY + 22);

    const arrayGroup = g.append('g').attr('class', 'array-group');
    arrayGroup.append('text')
      .attr('x', startX)
      .attr('y', arrayY - 34)
      .attr('class', 'section-title')
      .text('数组状态与双指针窗口');

    drawSearchWindow(arrayGroup, pointers, startX, arrayY, cellWidth, cellHeight, gap);

    arrayState.forEach((item, idx) => {
      const x = startX + idx * (cellWidth + gap);
      drawArrayCell(arrayGroup, item, idx, x, arrayY, cellWidth, cellHeight, animationType);
    });

    drawPointers(arrayGroup, pointers, startX, arrayY, cellWidth, gap);
    drawMovement(arrayGroup, decision?.movedPointer, decision?.previousPointers, pointers, startX, arrayY, cellWidth, gap);

    const detailY = arrayY + cellHeight + 86;
    drawDecisionPanel(g, startX, detailY, 410, currentStep, decisionPointers);
    drawVariables(g, startX + 438, detailY, variables);
    drawResults(g, startX, detailY + 116, result, contentWidth);
  }, [currentStep]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <g className="canvas-content"></g>
      </svg>
      <div className="canvas-hint">拖动平移 · 滚轮缩放</div>
    </div>
  );
}

function drawStage(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  width: number,
  description: string,
  step: AlgorithmStep
) {
  const panel = g.append('g').attr('class', `stage-panel ${step.animationType}`);

  panel.append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', 104)
    .attr('rx', 8)
    .attr('class', 'stage-panel-bg');

  panel.append('text')
    .attr('x', x + 18)
    .attr('y', y + 28)
    .attr('class', 'stage-kicker')
    .text(getStageTitle(step.animationType));

  const relation = step.decision?.relation;
  if (relation) {
    panel.append('text')
      .attr('x', x + 18)
      .attr('y', y + 58)
      .attr('class', `relation-badge ${relation}`)
      .text(getRelationText(relation));
  }

  appendWrappedText(
    panel,
    description,
    x + 118,
    y + 30,
    Math.min(520, width - 460),
    18,
    'step-description'
  );

  panel.append('text')
    .attr('x', x + 118)
    .attr('y', y + 82)
    .attr('class', 'decision-action')
    .text(step.decision?.action ?? '展示当前算法状态');
}

function drawLegend(g: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number) {
  const items = [
    { label: '固定值', color: POINTER_COLORS.i },
    { label: '左指针', color: POINTER_COLORS.left },
    { label: '右指针', color: POINTER_COLORS.right },
    { label: '命中', color: '#db2777' }
  ];

  const legend = g.append('g').attr('class', 'legend');
  items.forEach((item, idx) => {
    const itemX = x + idx * 78;
    legend.append('circle')
      .attr('cx', itemX)
      .attr('cy', y)
      .attr('r', 5)
      .attr('fill', item.color);
    legend.append('text')
      .attr('x', itemX + 10)
      .attr('y', y + 4)
      .attr('class', 'legend-label')
      .text(item.label);
  });
}

function drawSearchWindow(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  pointers: PointerState,
  startX: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
  gap: number
) {
  if (pointers.left < 0 || pointers.right < 0 || pointers.left > pointers.right) return;

  const x = startX + pointers.left * (cellWidth + gap) - gap / 2;
  const width = (pointers.right - pointers.left + 1) * cellWidth + (pointers.right - pointers.left) * gap + gap;

  g.append('rect')
    .attr('x', x)
    .attr('y', y - 10)
    .attr('width', width)
    .attr('height', cellHeight + 20)
    .attr('rx', 8)
    .attr('class', 'search-window');

  g.append('text')
    .attr('x', x + width / 2)
    .attr('y', y + cellHeight + 27)
    .attr('class', 'window-label')
    .text('当前搜索窗口');
}

function drawArrayCell(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  item: AlgorithmStep['arrayState'][number],
  idx: number,
  x: number,
  y: number,
  width: number,
  height: number,
  animationType: AlgorithmStep['animationType']
) {
  const cell = g.append('g')
    .attr('class', `array-cell-group ${item.highlight}`)
    .attr('transform', `translate(${x},${y})`);

  const rect = cell.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('rx', 6)
    .attr('class', `array-cell ${item.highlight}`);

  cell.append('text')
    .attr('x', width / 2)
    .attr('y', 21)
    .attr('class', 'cell-value')
    .text(item.value);

  cell.append('text')
    .attr('x', width / 2)
    .attr('y', height + 16)
    .attr('class', 'cell-index')
    .text(idx);

  if (width >= 42) {
    cell.append('text')
      .attr('x', width / 2)
      .attr('y', 38)
      .attr('class', 'cell-origin')
      .text(`原${item.originalIndex}`);
  }

  if (animationType === 'found' && item.highlight === 'found') {
    rect.transition()
      .duration(180)
      .attr('transform', `translate(${width * -0.04},${height * -0.04}) scale(1.08)`)
      .transition()
      .duration(180)
      .attr('transform', 'translate(0,0) scale(1)');
  }
}

function drawPointers(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  pointers: PointerState,
  startX: number,
  arrayY: number,
  cellWidth: number,
  gap: number
) {
  drawPointer(g, pointers.i, startX, arrayY - 20, cellWidth, gap, 'i', POINTER_COLORS.i);
  drawPointer(g, pointers.left, startX, arrayY - 48, cellWidth, gap, 'left', POINTER_COLORS.left);
  drawPointer(g, pointers.right, startX, arrayY - 48, cellWidth, gap, 'right', POINTER_COLORS.right);
}

function drawPointer(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  index: number,
  startX: number,
  y: number,
  cellWidth: number,
  gap: number,
  key: keyof PointerState,
  color: string
) {
  if (index < 0) return;

  const x = startX + index * (cellWidth + gap) + cellWidth / 2;
  const pointerGroup = g.append('g').attr('class', `pointer ${key}`);

  pointerGroup.append('line')
    .attr('x1', x)
    .attr('x2', x)
    .attr('y1', y + 18)
    .attr('y2', y + 43)
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '3 3');

  pointerGroup.append('path')
    .attr('d', `M${x},${y + 48} L${x - 7},${y + 36} L${x + 7},${y + 36} Z`)
    .attr('fill', color);

  pointerGroup.append('rect')
    .attr('x', x - 22)
    .attr('y', y)
    .attr('width', 44)
    .attr('height', 20)
    .attr('rx', 5)
    .attr('fill', color);

  pointerGroup.append('text')
    .attr('x', x)
    .attr('y', y + 14)
    .attr('class', 'pointer-label')
    .text(POINTER_LABELS[key]);
}

function drawMovement(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  movedPointer: NonNullable<AlgorithmStep['decision']>['movedPointer'],
  previous: PointerState | undefined,
  current: PointerState,
  startX: number,
  arrayY: number,
  cellWidth: number,
  gap: number
) {
  if (!movedPointer || !previous) return;

  const pointerKeys: Array<keyof PointerState> = movedPointer === 'both' ? ['left', 'right'] : [movedPointer];
  pointerKeys.forEach((key, idx) => {
    const from = previous[key];
    const to = current[key];
    if (from < 0 || to < 0 || from === to) return;

    const x1 = startX + from * (cellWidth + gap) + cellWidth / 2;
    const x2 = startX + to * (cellWidth + gap) + cellWidth / 2;
    const y = arrayY + 78 + idx * 20;
    const color = key === 'right' ? POINTER_COLORS.right : POINTER_COLORS.left;

    g.append('line')
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', y)
      .attr('y2', y)
      .attr('class', 'move-line')
      .attr('stroke', color);

    g.append('path')
      .attr('d', x2 > x1
        ? `M${x2},${y} L${x2 - 8},${y - 5} L${x2 - 8},${y + 5} Z`
        : `M${x2},${y} L${x2 + 8},${y - 5} L${x2 + 8},${y + 5} Z`)
      .attr('fill', color);

    g.append('text')
      .attr('x', (x1 + x2) / 2)
      .attr('y', y - 7)
      .attr('class', 'move-label')
      .text(`${POINTER_LABELS[key]}: ${from} -> ${to}`);
  });
}

function drawDecisionPanel(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  width: number,
  step: AlgorithmStep,
  pointers: PointerState
) {
  const panel = g.append('g').attr('class', 'info-panel decision-panel');

  panel.append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', 92)
    .attr('rx', 8)
    .attr('class', 'info-panel-bg');

  panel.append('text')
    .attr('x', x + 14)
    .attr('y', y + 24)
    .attr('class', 'section-title')
    .text('本步判断');

  const values = getPointerValues(step, pointers);
  const sum = step.decision?.sum ?? values.sum;
  const formulaText = values.valid
    ? `${values.i} + ${values.left} + ${values.right} = ${sum}`
    : '等待进入双指针扫描';

  panel.append('text')
    .attr('x', x + 14)
    .attr('y', y + 52)
    .attr('class', 'formula-text')
    .text(formulaText);

  if (step.decision?.target !== undefined) {
    panel.append('text')
      .attr('x', x + 14)
      .attr('y', y + 76)
      .attr('class', 'target-text')
      .text(`目标：left + right = ${step.decision.target}`);
  }

  if (step.decision?.relation) {
    panel.append('text')
      .attr('x', x + width - 102)
      .attr('y', y + 53)
      .attr('class', `relation-pill ${step.decision.relation}`)
      .text(getRelationText(step.decision.relation));
  }
}

function drawVariables(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  variables: AlgorithmStep['variables']
) {
  const panel = g.append('g').attr('class', 'info-panel vars-panel');

  panel.append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', 322)
    .attr('height', 92)
    .attr('rx', 8)
    .attr('class', 'info-panel-bg');

  panel.append('text')
    .attr('x', x + 14)
    .attr('y', y + 24)
    .attr('class', 'section-title')
    .text('变量状态');

  const visibleVars = variables.slice(0, 5);
  visibleVars.forEach((variable, idx) => {
    const varX = x + 14 + (idx % 2) * 150;
    const varY = y + 50 + Math.floor(idx / 2) * 24;

    panel.append('text')
      .attr('x', varX)
      .attr('y', varY)
      .attr('class', `var-text ${variable.highlight ? 'highlight' : ''}`)
      .text(`${variable.name}: ${formatValue(variable.value)}`);
  });
}

function drawResults(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  result: number[][],
  width: number
) {
  const panel = g.append('g').attr('class', 'result-group');

  panel.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('class', 'section-title')
    .text(`已找到三元组：${result.length} 组`);

  if (result.length === 0) {
    panel.append('text')
      .attr('x', x)
      .attr('y', y + 30)
      .attr('class', 'empty-result')
      .text('暂无命中，继续移动指针搜索');
    return;
  }

  const tripletWidth = 150;
  const columns = Math.max(1, Math.floor(width / (tripletWidth + 14)));

  result.forEach((triplet, idx) => {
    const col = idx % columns;
    const row = Math.floor(idx / columns);
    const tripletX = x + col * (tripletWidth + 14);
    const tripletY = y + 20 + row * 36;
    const tripletGroup = panel.append('g').attr('class', 'triplet-chip');

    tripletGroup.append('rect')
      .attr('x', tripletX)
      .attr('y', tripletY)
      .attr('width', tripletWidth)
      .attr('height', 28)
      .attr('rx', 6)
      .attr('class', 'triplet-bg');

    tripletGroup.append('text')
      .attr('x', tripletX + tripletWidth / 2)
      .attr('y', tripletY + 18)
      .attr('class', 'triplet-text')
      .text(`[${triplet.join(', ')}]`);
  });
}

function getCellWidth(length: number): number {
  if (length <= 8) return 58;
  if (length <= 14) return 52;
  if (length <= 24) return 44;
  return 36;
}

function getPointerValues(step: AlgorithmStep, pointers: PointerState) {
  const i = getValueAt(step, pointers.i);
  const left = getValueAt(step, pointers.left);
  const right = getValueAt(step, pointers.right);
  const valid = i !== null && left !== null && right !== null;
  return {
    valid,
    i,
    left,
    right,
    sum: valid ? i + left + right : undefined
  };
}

function getValueAt(step: AlgorithmStep, index: number): number | null {
  if (index < 0 || index >= step.arrayState.length) return null;
  return step.arrayState[index].value;
}

function getStageTitle(animationType: AlgorithmStep['animationType']): string {
  const titles: Record<AlgorithmStep['animationType'], string> = {
    init: '初始化',
    sort: '排序',
    'move-i': '固定 i',
    compare: '计算 sum',
    found: '找到解',
    skip: '跳过重复',
    'move-left': '移动 left',
    'move-right': '移动 right',
    complete: '完成'
  };
  return titles[animationType];
}

function getRelationText(relation: NonNullable<NonNullable<AlgorithmStep['decision']>['relation']>): string {
  if (relation === 'equal') return 'sum = 0';
  if (relation === 'less') return 'sum < 0';
  return 'sum > 0';
}

function appendWrappedText(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  className: string
) {
  const words = text.split('');
  const textNode = parent.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('class', className);

  let line = '';
  let lineNumber = 0;
  let tspan = textNode.append('tspan')
    .attr('x', x)
    .attr('dy', 0);

  words.forEach(char => {
    const testLine = line + char;
    tspan.text(testLine);
    if ((tspan.node()?.getComputedTextLength() ?? 0) > maxWidth && line) {
      tspan.text(line);
      line = char;
      lineNumber += 1;
      tspan = textNode.append('tspan')
        .attr('x', x)
        .attr('dy', lineHeight)
        .text(line);
    } else {
      line = testLine;
    }
  });

  if (lineNumber > 1) {
    textNode.selectAll('tspan')
      .filter((_, idx) => idx > 1)
      .remove();
    textNode.append('tspan')
      .attr('x', x)
      .attr('dy', lineHeight)
      .text('...');
  }
}

function formatValue(value: string | number | number[] | number[][]): string {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return `[${(value as number[][]).map(arr => `[${arr.join(',')}]`).join(', ')}]`;
    }
    return `[${value.join(', ')}]`;
  }
  return String(value);
}
