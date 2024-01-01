import Matrix from "gl/transform/Matrix";
import { List, forEach } from "world/sprite/List";

export type Position = [number, number, number];

const _position: Position = [0, 0, 0];
const _matrix: Matrix = Matrix.create();
export function transformsToPosition(transforms: List<Matrix>) {
  _matrix.identity();
  forEach(transforms, transform => _matrix.multiply(transform));
  return transformToPosition(_matrix);
}

export function transformToPosition(transform: Matrix) {
  const m = transform.getMatrix();
  _position[0] = m[12]; // Value in the 4th column, 1st row (indices start from 0)
  _position[1] = m[13]; // Value in the 4th column, 2nd row
  _position[2] = m[14]; // Value in the 4th column, 3rd row
  return _position;
}
