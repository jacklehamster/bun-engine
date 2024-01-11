import { vec3 } from "gl-matrix";

export interface IMatrix {
  getMatrix(): Float32Array;
}

export type vector = vec3;
