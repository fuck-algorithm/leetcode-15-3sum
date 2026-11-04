import type { AlgorithmStep } from '../../types';
import type { CanvasDimensions, CanvasLayout } from './types';

export function createCanvasLayout(step: AlgorithmStep, dimensions: CanvasDimensions): CanvasLayout {
  const gap = 12;
  const mobile = dimensions.width < 560;
  const compact = dimensions.width < 900;
  const cellWidth = mobile ? Math.max(34, getCellWidth(step.arrayState.length, dimensions.width) - 10) : getCellWidth(step.arrayState.length, dimensions.width);
  const cellGap = mobile ? 8 : gap;
  const cellHeight = 56;
  const arrayWidth = step.arrayState.length * cellWidth + Math.max(0, step.arrayState.length - 1) * cellGap;
  const panelGroupWidth = 410 + 24 + 322;
  const contentWidth = mobile
    ? Math.max(dimensions.width - 32, arrayWidth + 32)
    : compact
      ? Math.min(dimensions.width - 96, Math.max(760, arrayWidth + 96, panelGroupWidth + 48))
      : Math.max(760, arrayWidth + 96, panelGroupWidth + 48);
  const startX = mobile ? 16 : 48;
  const arrayOverflows = mobile ? false : arrayWidth + 96 >= contentWidth;
  const contentGroupWidth = mobile ? contentWidth : Math.min(contentWidth, Math.max(760, arrayWidth + 96, panelGroupWidth + 48));
  const contentStartX = mobile
    ? startX
    : arrayOverflows
      ? startX
      : Math.max(startX, Math.round((dimensions.width - contentGroupWidth) / 2));
  const nodesX = mobile ? contentStartX : arrayOverflows ? startX : contentStartX + Math.round((contentGroupWidth - arrayWidth) / 2);
  const arrayStartX = mobile || !arrayOverflows
    ? nodesX
    : startX;
  const stageY = mobile ? 40 : compact ? 52 : 24;
  const stageWidth = Math.max(0, Math.min(contentWidth, dimensions.width - contentStartX * 2));
  const stageHeight = mobile ? 112 : 104;
  const narrationX = mobile ? contentStartX + 18 : contentStartX + 118;
  const narrationY = mobile ? stageY + 48 : stageY + 30;
  const narrationWidth = mobile ? Math.max(140, stageWidth - 36) : Math.max(120, Math.min(560, stageWidth - 454));
  const narrationLines = 2;
  const panelWidth = mobile ? Math.max(140, contentWidth) : Math.min(410, contentWidth - 24 - 322);
  const panelGroup = mobile ? panelWidth : panelWidth + 24 + 322;
  const panelX = mobile ? contentStartX : contentStartX + (contentWidth - panelGroup) / 2;
  const variablesX = mobile ? contentStartX : compact ? contentStartX + (contentWidth - 322) / 2 : panelX + panelWidth + 24;
  const stageBottom = stageY + stageHeight;
  const headerRight = Math.max(8, Math.ceil(stageBottom + (mobile ? 16 : 20) - 8));
  const arrayY = Math.max(mobile ? 300 : compact ? 248 : 208, Math.round(dimensions.height * 0.38));
  const arrayTop = Math.max(arrayY, stageBottom + (mobile ? 92 : 96));
  const detailY = mobile ? arrayTop + cellHeight + 84 : compact ? arrayTop + cellHeight + 124 : arrayTop + cellHeight + 148;
  const variablesY = mobile ? detailY + 124 : compact ? detailY + 124 : detailY;
  const resultY = Math.max(detailY + (mobile ? 260 : compact ? 208 : 124), variablesY + (mobile ? 124 : compact ? 124 : 0));
  const legendWidth = mobile ? 164 : 180;
  const toolbarLeft = dimensions.width < 560
    ? Math.max(8, dimensions.width - 162)
    : dimensions.width < 900
      ? Math.max(8, dimensions.width - 154)
      : dimensions.width - 167;
  const arrowY = arrayTop + cellHeight + 8;
  const resultsX = mobile ? contentStartX : contentStartX;
  const resultColumns = Math.max(1, Math.floor(contentWidth / 164));
  const resultRows = Math.ceil(step.result.length / resultColumns);
  const contentHeight = Math.max(dimensions.height - 32, resultY + Math.max(96, resultRows * 40 + 40));

  return { gap: cellGap, cellWidth, cellHeight, startX, contentStartX, arrayStartX, stageY, arrayY, arrayWidth, contentWidth, detailY, resultY, contentHeight, resultColumns, mobile, stageWidth, stageHeight, narrationX, narrationY, narrationWidth, narrationLines, toolbarLeft, nodesX, legendWidth, variablesX, variablesY, headerRight, arrayTop, arrowY, resultsX, panelX, panelWidth };
}

function getCellWidth(length: number, viewportWidth: number): number {
  const visibleCellBudget = Math.max(240, viewportWidth - 144);
  const pitch = Math.min(74, Math.max(56, visibleCellBudget / Math.max(1, Math.min(length, 14))));
  return Math.floor(pitch - 12);
}
