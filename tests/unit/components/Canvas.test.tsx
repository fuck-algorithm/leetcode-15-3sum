import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Canvas } from '../../../src/components/Canvas/Canvas';
import { generateSteps, EXAMPLE_DATA } from '../../../src/algorithms/threeSum';

class TestResizeObserver implements ResizeObserver {
  observe(target: Element) {
    queueMicrotask(() => this.callback([{ target, contentRect: { width: 920, height: 520 } } as ResizeObserverEntry], this));
  }
  unobserve() {}
  disconnect() {}
  constructor(private callback: ResizeObserverCallback) {}
}

describe('Canvas visualization', () => {
  it('renders keyed array nodes, operation, narration and fixed legend', async () => {
    globalThis.matchMedia = (query: string) => ({ matches: true, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false });
    globalThis.ResizeObserver = TestResizeObserver;
    const steps = generateSteps(EXAMPLE_DATA[0].value);
    const { rerender, container } = render(<Canvas currentStep={steps[0]} />);
    await waitFor(() => expect(container.querySelector('.layer-nodes')).not.toBeNull());
    expect(container.querySelectorAll('[data-node-id^="array-"]')).toHaveLength(6);
    expect(container.querySelector('.stage-panel')?.getAttribute('data-operation')).toBe(steps[0].operation);
    expect(container.querySelector('.operation-badge')?.textContent).toBe('init');
    expect(container.querySelector('.canvas-legend')).not.toBeNull();
    expect(container.querySelector('#sum-flow-arrow')).not.toBeNull();

    rerender(<Canvas currentStep={steps[1]} />);
    expect(container.querySelectorAll('[data-node-id^="array-"]')).toHaveLength(6);
    expect(container.querySelector('.stage-panel')?.getAttribute('data-step-id')).toBe('1');
    expect(screen.getByLabelText('三数之和算法可视化画布')).toBeTruthy();
  });

  it('places skip markers at the actual array index', async () => {
    globalThis.matchMedia = (query: string) => ({ matches: true, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false });
    globalThis.ResizeObserver = TestResizeObserver;
    const step = generateSteps([-2, -2, 0, 1, 1]).find(item => item.animationType === 'skip' && item.pointers.i === 1);
    expect(step).toBeDefined();
    const { container } = render(<Canvas currentStep={step!} />);
    await waitFor(() => expect(container.querySelector('.skip-marker')).not.toBeNull());
    const marker = container.querySelector<SVGGElement>('.skip-marker')!;
    const node = container.querySelector<SVGGElement>('[data-node-id="array-1"]')!;
    expect(marker.getAttribute('transform')).toBe(node.getAttribute('transform'));
  });

  it('keeps zoom controls operable', () => {
    globalThis.matchMedia = (query: string) => ({ matches: true, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false });
    globalThis.ResizeObserver = TestResizeObserver;
    const { container } = render(<Canvas currentStep={generateSteps(EXAMPLE_DATA[0].value)[0]} />);
    fireEvent.click(within(container.querySelector('.canvas-container')!).getByRole('button', { name: '放大画布' }));
    expect(container.querySelector('.canvas-toolbar')).toBeTruthy();
  });
});
