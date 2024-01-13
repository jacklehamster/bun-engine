import { vec3 } from "gl-matrix";

export interface IMatrix {
  getMatrix(): Float32Array;
}

export type Vector = [number, number, number] & vec3;
