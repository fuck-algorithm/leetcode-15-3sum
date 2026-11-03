import * as d3 from 'd3';
import { motionDuration } from './motion';

export function fadeOutAndRemove<GElement extends Element, Datum>(
  selection: d3.Selection<GElement, Datum, Element, unknown>,
  duration = motionDuration('exit')
) {
  selection.interrupt('exit').classed('canvas-exit', true)
    .transition('exit').duration(duration).attr('opacity', 0)
    .on('end', function remove() { d3.select(this).remove(); });
}
