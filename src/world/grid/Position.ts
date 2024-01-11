import { IMatrix } from "gl/transform/IMatrix";
import Matrix from "gl/transform/Matrix";
import { List, forEach } from "world/sprite/List";

export type Position = [number, number, number];

const _position: Position = [0, 0, 0];
const _matrix: Matrix = Matrix.create();
export function transformsToPosition(transforms: List<Matrix>) {
  _matrix.identity();
  forEach(transforms, transform => { if (transform) { _matrix.multiply(transform); } });
  return transformToPosition(_matrix);
}

export function toPos(x: number, y: number, z: number): Position {
  _position[0] = x;
  _position[1] = y;
  _position[2] = z;
  return _position;
}

export function transformToPosition(transform: IMatrix, pos: Position = _position) {
  const m = transform.getMatrix();
  pos[0] = m[12]; // Value in the 4th column, 1st row (indices start from 0)
  pos[1] = m[13]; // Value in the 4th column, 2nd row
  pos[2] = m[14]; // Value in the 4th column, 3rd row
  return pos;
}
