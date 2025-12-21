import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
}

export function Canvas({ currentStep }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // 监听容器大小变化
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

  // 绑定缩放和拖动
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.select('.canvas-content');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // 初始居中
    const initialTransform = d3.zoomIdentity.translate(dimensions.width / 2 - 300, 50);
    svg.call((zoom as any).transform, initialTransform);
  }, [dimensions]);

  // 绘制可视化
  useEffect(() => {
    if (!currentStep || !svgRef.current) return;

    const g = d3.select(svgRef.current).select('.canvas-content');
    g.selectAll('*').remove();

    const { arrayState, pointers, result, description, variables } = currentStep;
    
    // 配置
    const cellWidth = 50;
    const cellHeight = 40;
    const startX = 50;
    const startY = 30;
    const gap = 4;

    // 绘制数组
    const arrayGroup = g.append('g').attr('class', 'array-group');
    
    // 数组标题
    arrayGroup.append('text')
      .attr('x', startX)
      .attr('y', startY - 10)
      .attr('class', 'section-title')
      .text('排序后数组');

    // 绘制数组元素
    arrayState.forEach((item, idx) => {
      const x = startX + idx * (cellWidth + gap);
      const y = startY;

      // 背景
      const rect = arrayGroup.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('rx', 4)
        .attr('class', `array-cell ${item.highlight}`);

      // 值
      arrayGroup.append('text')
        .attr('x', x + cellWidth / 2)
        .attr('y', y + cellHeight / 2 + 5)
        .attr('class', 'cell-value')
        .text(item.value);

      // 索引
      arrayGroup.append('text')
        .attr('x', x + cellWidth / 2)
        .attr('y', y + cellHeight + 14)
        .attr('class', 'cell-index')
        .text(idx);

      // 添加动画
      if (item.highlight !== 'none') {
        rect.transition()
          .duration(300)
          .attr('transform', 'scale(1.05)')
          .attr('transform-origin', `${x + cellWidth / 2}px ${y + cellHeight / 2}px`);
      }
    });

    // 绘制指针
    const pointerY = startY - 25;
    const pointerColors = {
      i: '#3b82f6',
      left: '#10b981',
      right: '#f59e0b'
    };

    if (pointers.i >= 0 && pointers.i < arrayState.length) {
      drawPointer(arrayGroup, startX + pointers.i * (cellWidth + gap) + cellWidth / 2, pointerY, 'i', pointerColors.i);
    }
    if (pointers.left >= 0 && pointers.left < arrayState.length) {
      drawPointer(arrayGroup, startX + pointers.left * (cellWidth + gap) + cellWidth / 2, pointerY - 20, 'L', pointerColors.left);
    }
    if (pointers.right >= 0 && pointers.right < arrayState.length) {
      drawPointer(arrayGroup, startX + pointers.right * (cellWidth + gap) + cellWidth / 2, pointerY - 20, 'R', pointerColors.right);
    }

    // 绘制变量区域
    const varsY = startY + cellHeight + 50;
    const varsGroup = g.append('g').attr('class', 'vars-group');
    
    varsGroup.append('text')
      .attr('x', startX)
      .attr('y', varsY)
      .attr('class', 'section-title')
      .text('变量状态');

    variables.forEach((v, idx) => {
      const varY = varsY + 25 + idx * 22;
      
      varsGroup.append('text')
        .attr('x', startX)
        .attr('y', varY)
        .attr('class', `var-name ${v.highlight ? 'highlight' : ''}`)
        .text(`${v.name}:`);

      varsGroup.append('text')
        .attr('x', startX + 80)
        .attr('y', varY)
        .attr('class', `var-value ${v.highlight ? 'highlight' : ''}`)
        .text(formatValue(v.value));
    });

    // 绘制结果区域
    const resultY = varsY + 25 + variables.length * 22 + 30;
    const resultGroup = g.append('g').attr('class', 'result-group');
    
    resultGroup.append('text')
      .attr('x', startX)
      .attr('y', resultY)
      .attr('class', 'section-title')
      .text(`找到的三元组 (${result.length}组)`);

    result.forEach((triplet, idx) => {
      const tripletY = resultY + 25 + idx * 28;
      const tripletGroup = resultGroup.append('g');

      triplet.forEach((num, numIdx) => {
        const numX = startX + numIdx * 45;
        
        tripletGroup.append('rect')
          .attr('x', numX)
          .attr('y', tripletY - 15)
          .attr('width', 40)
          .attr('height', 24)
          .attr('rx', 4)
          .attr('class', 'result-cell');

        tripletGroup.append('text')
          .attr('x', numX + 20)
          .attr('y', tripletY)
          .attr('class', 'result-value')
          .text(num);
      });
    });

    // 绘制描述
    const descY = 20;
    g.append('text')
      .attr('x', startX + arrayState.length * (cellWidth + gap) + 50)
      .attr('y', descY)
      .attr('class', 'step-description')
      .text(description);

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

function drawPointer(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  label: string,
  color: string
) {
  const pointerGroup = g.append('g').attr('class', 'pointer');
  
  // 箭头
  pointerGroup.append('path')
    .attr('d', `M${x},${y + 15} L${x - 6},${y} L${x + 6},${y} Z`)
    .attr('fill', color);

  // 标签
  pointerGroup.append('rect')
    .attr('x', x - 12)
    .attr('y', y - 20)
    .attr('width', 24)
    .attr('height', 18)
    .attr('rx', 4)
    .attr('fill', color);

  pointerGroup.append('text')
    .attr('x', x)
    .attr('y', y - 8)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .text(label);
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
