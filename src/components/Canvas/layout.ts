import type { AlgorithmStep } from '../../types';
import type { CanvasDimensions, CanvasLayout } from './types';

export function createCanvasLayout(step: AlgorithmStep, dimensions: CanvasDimensions): CanvasLayout {
  const gap = 12;
  const cellWidth = getCellWidth(step.arrayState.length, dimensions.width);
  const cellHeight = 56;
  const startX = 48;
  const stageY = 24;
  const arrayY = Math.max(208, Math.round(dimensions.height * 0.38));
  const arrayWidth = step.arrayState.length * cellWidth + Math.max(0, step.arrayState.length - 1) * gap;
  const contentWidth = Math.max(760, arrayWidth + 96, dimensions.width - 96);
  const detailY = arrayY + cellHeight + 124;
  const resultY = detailY + 124;
  const resultColumns = Math.max(1, Math.floor(contentWidth / 164));
  const resultRows = Math.ceil(step.result.length / resultColumns);
  const contentHeight = Math.max(dimensions.height - 32, resultY + Math.max(96, resultRows * 40 + 40));

  return { gap, cellWidth, cellHeight, startX, stageY, arrayY, arrayWidth, contentWidth, detailY, resultY, contentHeight, resultColumns };
}

function getCellWidth(length: number, viewportWidth: number): number {
  const visibleCellBudget = Math.max(240, viewportWidth - 144);
  const pitch = Math.min(74, Math.max(56, visibleCellBudget / Math.max(1, Math.min(length, 14))));
  return Math.floor(pitch - 12);
}
