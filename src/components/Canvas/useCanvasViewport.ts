import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { RefObject } from 'react';
import type { CanvasDimensions } from './types';

interface ViewportControls {
  isDragging: boolean;
  zoomLevel: number;
  transform: d3.ZoomTransform;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  scrollToFraction: (fraction: number) => void;
}

const INITIAL_TRANSFORM = d3.zoomIdentity.translate(0, 18);

export function useCanvasViewport(
  svgRef: RefObject<SVGSVGElement | null>,
  contentRef: RefObject<SVGGElement | null>,
  dimensions: CanvasDimensions,
  contentBounds: { width: number; height: number } = dimensions
): ViewportControls {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [transform, setTransform] = useState<d3.ZoomTransform>(INITIAL_TRANSFORM);
  const [isDragging, setIsDragging] = useState(false);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const svgNode = svgRef.current;
    const contentNode = contentRef.current;
    if (!svgNode || !contentNode) return;

    const svg = d3.select(svgNode);
    const content = d3.select(contentNode);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.55, 2.8])
      .translateExtent([[0, 0], [contentBounds.width, contentBounds.height]])
      .on('start', () => setIsDragging(true))
      .on('zoom', event => {
        content.attr('transform', event.transform.toString());
        setZoomLevel(event.transform.k);
        setTransform(event.transform);
      })
      .on('end', () => setIsDragging(false));

    zoomRef.current = zoom;
    svg.call(zoom);
    svg.on('dblclick.zoom', null);

    if (!initializedRef.current) {
      initializedRef.current = true;
      svg.call(zoom.transform, INITIAL_TRANSFORM);
    }

    return () => {
      svg.interrupt();
      svg.selectAll('*').interrupt();
      svg.on('.zoom', null);
    };
  }, [contentBounds.height, contentBounds.width, contentRef, dimensions.height, dimensions.width, svgRef]);

  const applyScale = useCallback((factor: number) => {
    const svgNode = svgRef.current;
    if (!svgNode || !zoomRef.current) return;

    d3.select(svgNode).call(zoomRef.current.scaleBy, factor);
  }, [svgRef]);

  const resetView = useCallback(() => {
    const svgNode = svgRef.current;
    if (!svgNode || !zoomRef.current) return;

    d3.select(svgNode).call(zoomRef.current.transform, INITIAL_TRANSFORM);
  }, [svgRef]);

  const scrollToFraction = useCallback((fraction: number) => {
    const svgNode = svgRef.current;
    if (!svgNode || !zoomRef.current) return;
    const clamped = Math.max(0, Math.min(1, fraction));
    const maxX = Math.max(0, contentBounds.width * zoomLevel - dimensions.width);
    const x = -Math.round(maxX * clamped);
    d3.select(svgNode).call(zoomRef.current.transform, d3.zoomIdentity.translate(x, 18).scale(zoomLevel));
  }, [contentBounds.width, dimensions.width, svgRef, zoomLevel]);

  return useMemo(() => ({
    isDragging,
    zoomLevel,
    transform,
    zoomIn: () => applyScale(1.18),
    zoomOut: () => applyScale(1 / 1.18),
    resetView,
    scrollToFraction
  }), [applyScale, isDragging, resetView, scrollToFraction, transform, zoomLevel]);
}
