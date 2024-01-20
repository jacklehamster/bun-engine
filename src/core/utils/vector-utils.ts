import { Vector } from "core/types/Vector";

function distSq(v1: Vector, v2: Vector) {
  const dx = v1[0] - v2[0];
  const dy = v1[1] - v2[1];
  const dz = v1[2] - v2[2];
  return dx * dx + dy * dy + dz * dz;
}

export function dist(v1: Vector, v2: Vector) {
  return Math.sqrt(distSq(v1, v2));
}

export function equal(v1: Vector, v2: Vector, threshold = 0) {
  return distSq(v1, v2) <= threshold * threshold;
}
