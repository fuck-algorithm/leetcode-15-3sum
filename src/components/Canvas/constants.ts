import type { AlgorithmStep, PointerState } from '../../types';

export const POINTER_COLORS: Record<keyof PointerState, string> = {
  i: '#2563eb',
  left: '#059669',
  right: '#d97706'
};

export const POINTER_LABELS: Record<keyof PointerState, string> = {
  i: 'i',
  left: 'left',
  right: 'right'
};

export const STAGE_TITLES: Record<AlgorithmStep['animationType'], string> = {
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
