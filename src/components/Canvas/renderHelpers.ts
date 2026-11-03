import type { Selection } from 'd3';
import type { AlgorithmStep, PointerState } from '../../types';

export function getPointerValues(step: AlgorithmStep, pointers: PointerState) {
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

export function getValueAt(step: AlgorithmStep, index: number): number | null {
  if (index < 0 || index >= step.arrayState.length) return null;
  return step.arrayState[index].value;
}

export function getRelationText(relation: NonNullable<NonNullable<AlgorithmStep['decision']>['relation']>): string {
  if (relation === 'equal') return 'sum = 0';
  if (relation === 'less') return 'sum < 0';
  return 'sum > 0';
}

export function appendWrappedText(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: Selection<SVGGElement, any, any, any>,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  className: string
): Selection<SVGTextElement, string, SVGGElement, unknown> {
  const lines: string[] = [];
  let line = '';
  for (const character of text) {
    const candidate = line + character;
    const estimatedWidth = candidate.length * 7;
    if (line && estimatedWidth > maxWidth) {
      lines.push(line);
      line = character;
    } else {
      line = candidate;
    }
  }
  if (line || lines.length === 0) lines.push(line);
  if (lines.length > 2) {
    lines.length = 2;
    lines[1] = `${lines[1].slice(0, Math.max(1, Math.floor(maxWidth / 7) - 3))}…`;
  }

  const classSelector = className.split(/\s+/).filter(Boolean).map(value => `.${value}`).join('');
  const textNode = parent.selectAll<SVGTextElement, string>(`text${classSelector}`)
    .data([text]).join('text')
    .attr('x', x).attr('y', y).attr('class', className);
  textNode.selectAll<SVGTSpanElement, string>('tspan').data(lines, (_, index) => String(index)).join('tspan')
    .attr('x', x).attr('dy', (_, index) => index === 0 ? 0 : lineHeight).text(value => value);
  textNode.attr('data-line-count', lines.length);
  return textNode;
}

export function formatValue(value: string | number | number[] | number[][]): string {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return `[${(value as number[][]).map(arr => `[${arr.join(',')}]`).join(', ')}]`;
    }
    return `[${value.join(', ')}]`;
  }

  return String(value);
}
