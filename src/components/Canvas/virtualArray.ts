import type { AlgorithmStep } from '../../types';

export interface VisibleArrayRange {
  start: number;
  end: number;
}

export interface CanvasTransform {
  x: number;
  k: number;
}

const VIRTUALIZATION_THRESHOLD = 80;
const MAX_VISIBLE_NODES = 96;

export function getVisibleArrayRange(
  length: number,
  viewportWidth: number,
  transform: CanvasTransform,
  startX: number,
  pitch: number,
  buffer = 8
): VisibleArrayRange {
  if (length <= VIRTUALIZATION_THRESHOLD || pitch <= 0 || transform.k <= 0) return { start: 0, end: length };
  const viewLeft = (0 - transform.x) / transform.k;
  const viewRight = (viewportWidth - transform.x) / transform.k;
  const rawStart = Math.max(0, Math.floor((viewLeft - startX) / pitch) - buffer);
  const rawEnd = Math.min(length, Math.ceil((viewRight - startX) / pitch) + buffer);
  const start = Math.min(rawStart, Math.max(0, length - MAX_VISIBLE_NODES));
  const end = Math.min(length, Math.max(rawEnd, Math.min(length, start + MAX_VISIBLE_NODES)));
  return { start: Math.min(start, length), end: Math.max(Math.min(end, length), Math.min(start + 1, length)) };
}

export function createVisibleFrame<T extends { index: number }>(
  items: T[],
  range: VisibleArrayRange,
  focusIndices: number[]
): T[] {
  const focused = new Set(focusIndices);
  return items.filter(item => item.index >= range.start && item.index < range.end || focused.has(item.index));
}

export function visibleFocusIndices(step: AlgorithmStep): number[] {
  const { i, left, right } = step.pointers;
  const active = step.animationType === 'compare' || step.animationType === 'found'
    ? [i, left, right]
    : [i, left, right];
  return [...new Set(active.filter(index => index >= 0 && index < step.arrayState.length))];
}
