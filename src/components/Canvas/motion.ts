export const MOTION = {
  enter: 220,
  move: 180,
  exit: 160,
  dwell: 1000
} as const;

export function motionDuration(token: keyof typeof MOTION, speed = 1, reducedMotion = false): number {
  if (reducedMotion) return 0;
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  return Math.round(MOTION[token] / safeSpeed);
}
