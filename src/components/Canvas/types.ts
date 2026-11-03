import type * as d3 from 'd3';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface CanvasViewportTransform {
  x: number;
  y: number;
  k: number;
}

export interface CanvasLayout {
  gap: number;
  cellWidth: number;
  cellHeight: number;
  startX: number;
  contentStartX: number;
  arrayStartX: number;
  stageY: number;
  arrayY: number;
  arrayWidth: number;
  contentWidth: number;
  detailY: number;
  resultY: number;
  contentHeight: number;
  resultColumns: number;
}

// D3 selections carry different bound datum types across keyed layers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CanvasGroupSelection = d3.Selection<SVGGElement, any, any, any>;
