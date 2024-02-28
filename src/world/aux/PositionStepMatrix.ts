import { List } from "abstract-list";
import { toCell } from "cell-tracker";
import { ICollisionDetector, MoveResult, PositionMatrix } from "dok-matrix";
import { Vector, equal } from "dok-types";

interface Props {
  blockers?: List<ICollisionDetector>;
}

export class PositionStepMatrix extends PositionMatrix {
  readonly #goalPos: Vector;
  #stepCount: number = 0;

  constructor({ blockers }: Props) {
    super({ blockers });
    this.#goalPos = [
      this.position[0],
      this.position[1],
      this.position[2],
    ];
  }

  cellMoveBy(dx: number, dz: number, cellSize: number, speed: number): MoveResult {
    const pos = this.position;
    const preX = toCell(pos[0], cellSize) * cellSize;
    const preY = toCell(pos[1], cellSize) * cellSize;
    const preZ = toCell(pos[2], cellSize) * cellSize;

    const movement = dx || dz;
    if (dx || dz || this.#stepCount > 0) {
      const gx = (toCell(pos[0], cellSize) + dx) * cellSize;
      const gz = (toCell(pos[2], cellSize) + dz) * cellSize;
      this.#goalPos[0] = gx;
      this.#goalPos[2] = gz;
    }

    if (!dx && !dz) {
      this.#stepCount = 0;
    }

    let moveResult = this.moveTowards(this.#goalPos[0], pos[1], this.#goalPos[2], speed);
    if (moveResult === MoveResult.BLOCKED && dx) {
      moveResult = this.moveTowards(this.#goalPos[0], pos[1], pos[2], speed);
    }
    if (moveResult === MoveResult.BLOCKED && dz) {
      moveResult = this.moveTowards(pos[0], pos[1], this.#goalPos[2], speed);
    }

    if (moveResult === MoveResult.BLOCKED) {
      const gx = toCell(pos[0], cellSize) * cellSize;
      const gz = toCell(pos[2], cellSize) * cellSize;
      this.#goalPos[0] = gx;
      this.#goalPos[2] = gz;
    }
    const newPos = this.position;
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
