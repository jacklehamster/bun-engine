import { toCell } from "cell-tracker";
import { IChangeListener } from "change-listener";
import { IMatrix, IPositionMatrix, MoveResult } from "dok-matrix";
import { Vector, equal } from "dok-types";

interface Props {
  position: IPositionMatrix;
}

export class PositionStep implements IMatrix {
  readonly #goalPos: Vector;
  readonly #position: IPositionMatrix;
  #stepCount: number = 0;

  constructor({ position }: Props) {
    this.#position = position;
    this.#goalPos = [
      this.#position.position[0],
      this.#position.position[1],
      this.#position.position[2],
    ];
  }

  get position(): Vector {
    return this.#position.position;
  }

  getMatrix(): Float32Array {
    return this.#position.getMatrix();
  }

  addChangeListener(listener: IChangeListener<IMatrix>): this {
    this.#position.addChangeListener(listener);
    return this;
  }

  removeChangeListener(listener: IChangeListener<IMatrix>): void {
    this.#position.removeChangeListener(listener);
  }

  cellMoveBy(dx: number, dy: number, dz: number, cellSize: number, speed: number): MoveResult {
    const pos = this.#position.position;
    const preX = toCell(pos[0], cellSize) * cellSize;
    const preY = toCell(pos[1], cellSize) * cellSize;
    const preZ = toCell(pos[2], cellSize) * cellSize;

    const movement = dx || dy || dz;
    if (movement || this.#stepCount > 0) {
      const gx = (toCell(pos[0], cellSize) + dx) * cellSize;
      const gy = (toCell(pos[1], cellSize) + dy) * cellSize;
      const gz = (toCell(pos[2], cellSize) + dz) * cellSize;
      this.#goalPos[0] = gx;
      this.#goalPos[1] = gy;
      this.#goalPos[2] = gz;
    }

    if (!dx && !dy && !dz) {
      this.#stepCount = 0;
    }

    const moveResult = this.#position.attemptMoveTowards(this.#goalPos[0], this.#goalPos[1], this.#goalPos[2], speed);

    if (moveResult === MoveResult.BLOCKED) {
      const gx = toCell(pos[0], cellSize) * cellSize;
      const gy = toCell(pos[1], cellSize) * cellSize;
      const gz = toCell(pos[2], cellSize) * cellSize;
      this.#goalPos[0] = gx;
      this.#goalPos[1] = gy;
      this.#goalPos[2] = gz;
    }
    const newPos = this.#position.position;
    if (toCell(newPos[0], cellSize) * cellSize !== preX
      || toCell(newPos[1], cellSize) * cellSize !== preY
      || toCell(newPos[2], cellSize) * cellSize !== preZ) {
      this.#stepCount++;
    }
    if (!movement && equal(newPos, this.#goalPos)) {
      return MoveResult.AT_POSITION;
    }
    return moveResult;
  }
}
