import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import { renderCanvas } from './renderer';
import { useCanvasViewport } from './useCanvasViewport';
import { createCanvasLayout } from './layout';
import type { CanvasDimensions } from './types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
  playbackSpeed?: number;
}

const INITIAL_DIMENSIONS: CanvasDimensions = { width: 800, height: 400 };

export function Canvas({ currentStep, playbackSpeed = 1 }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<CanvasDimensions>(INITIAL_DIMENSIONS);
  const [hasMeasured, setHasMeasured] = useState(false);
  const canvasLayout = currentStep ? createCanvasLayout(currentStep, dimensions) : null;
  const contentBounds = canvasLayout ? { width: canvasLayout.contentWidth + 96, height: canvasLayout.contentHeight } : dimensions;
  const { isDragging, zoomLevel, transform, zoomIn, zoomOut, resetView, scrollToFraction } = useCanvasViewport(svgRef, contentRef, dimensions, contentBounds);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      setDimensions({
        width: Math.max(320, width),
        height: Math.max(260, height)
      });
      setHasMeasured(true);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!currentStep || !contentRef.current) return;

    if (!hasMeasured) return;
    renderCanvas(d3.select(contentRef.current), currentStep, dimensions, playbackSpeed, transform);
  }, [currentStep, dimensions, hasMeasured, playbackSpeed, transform]);

  const legend = [
    { id: 'current', label: '当前', shape: 'current' },
    { id: 'compare', label: '比较', shape: 'compare' },
    { id: 'visited', label: '已排除', shape: 'visited' },
    { id: 'done', label: '命中', shape: 'done' }
  ];

  return (
    <div className={`canvas-container ${isDragging ? 'is-dragging' : ''}`} ref={containerRef}>
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} role="img" aria-label="三数之和算法可视化画布">
        <defs>
          <marker id="sum-flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10Z" fill="#64748b" />
          </marker>
        </defs>
        <g ref={contentRef} className="canvas-content"></g>
      </svg>

      {!currentStep && (
        <div className="canvas-empty">暂无可展示步骤</div>
      )}

      <div className="canvas-legend" aria-label="节点状态图例">
        {legend.map(item => (
          <span className="canvas-legend-item" key={item.id}>
            <i className={`legend-swatch legend-swatch--${item.shape}`} aria-hidden="true" />{item.label}
          </span>
        ))}
      </div>

      {currentStep && currentStep.arrayState.length > 80 && (
        <div className="canvas-array-overview" aria-label="数组全局位置导航">
          <span>数组导航</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={contentBounds.width <= dimensions.width ? 0 : Math.max(0, Math.min(1, -transform.x / (contentBounds.width - dimensions.width)))}
            aria-label="数组全局位置"
            onChange={event => scrollToFraction(Number(event.target.value))}
          />
          <span>{Math.round((contentBounds.width <= dimensions.width ? 0 : -transform.x / (contentBounds.width - dimensions.width)) * 100)}%</span>
        </div>
      )}

      <div className="canvas-toolbar" aria-label="画布缩放控制">
        <button type="button" onClick={zoomOut} aria-label="缩小画布">-</button>
        <span>{Math.round(zoomLevel * 100)}%</span>
        <button type="button" onClick={zoomIn} aria-label="放大画布">+</button>
        <button type="button" onClick={resetView} aria-label="重置画布视图">1:1</button>
      </div>
      <div className="canvas-hint">拖动平移 · 滚轮缩放</div>
    </div>
  );
}
