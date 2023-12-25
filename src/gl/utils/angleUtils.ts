export type Angle = number;

export function angle(value: number): Angle {
  return (value + Math.PI) % (2 * Math.PI) - Math.PI;
}

export function angleStep(angle: Angle, step: Angle) {
  return Math.round(angle / step) * step;
}
