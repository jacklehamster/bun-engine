import { PositionUtils } from "world/grid/utils/position-utils";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ICollisionDetector } from "../../world/collision/ICollisionDetector";
import { IPositionMatrix } from "./IPositionMatrix";
import { Vector } from "../../core/types/Vector";
import { ChangeListener } from "./IPositionMatrix";

export class PositionMatrix extends AuxiliaryHolder<PositionMatrix> implements IPositionMatrix {
  private readonly matrix: Matrix = Matrix.create().setPosition(0, 0, 0);
  private readonly changeListeners: Set<ChangeListener> = new Set();
  readonly position: Vector = [0, 0, 0];
  moveBlocker?: ICollisionDetector;

  constructor(private positionUtils: PositionUtils, onChange?: (dx: number, dy: number, dz: number) => void) {
    super();
    if (onChange) {
      this.onChange(onChange);
    }
  }

  onChange(listener: ChangeListener): this {
    this.changeListeners.add(listener);
    return this;
  }

  removeChangeListener(listener: ChangeListener) {
    this.changeListeners.delete(listener);
  }

  private changedPosition(dx: number, dy: number, dz: number) {
    PositionUtils.transformToPosition(this.matrix, this.position);
    for (let listener of this.changeListeners) {
      listener(dx, dy, dz);
    }
  }

  moveBy(x: number, y: number, z: number, turnMatrix?: IMatrix) {
    const vector = Matrix.getMoveVector(x, y, z, turnMatrix);
    const blocked = this.moveBlocker?.isBlocked(this.positionUtils.toVector(
      this.position[0] + vector[0],
      this.position[1] + vector[1],
      this.position[2] + vector[2],
    ), this.position);
    if (!blocked) {
      if (vector[0] || vector[1] || vector[2]) {
        this.matrix.move(vector);
        this.changedPosition(x, y, z);
      }
    }
    return !blocked;
  }

  moveTo(x: number, y: number, z: number) {
    const blocked = this.moveBlocker?.isBlocked(this.positionUtils.toVector(x, y, z), this.position);
    if (!blocked) {
      const [curX, curY, curZ] = this.matrix.getPosition();
      if (curX !== x || curY !== y || curZ !== z) {
        const dx = x - curX, dy = y - curY, dz = z - curZ;
        this.matrix.setPosition(x, y, z);
        this.changedPosition(dx, dy, dz);
      }
    }
    return !blocked;
  }

  movedTo(x: number, y: number, z: number): this {
    this.moveTo(x, y, z);
    return this;
  }

  gotoPos(x: number, y: number, z: number, speed: number = .1): boolean {
    const curPos = this.position;
    const dx = x - curPos[0];
    const dy = y - curPos[1];
    const dz = z - curPos[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > .01) {
      const sp = Math.min(dist, speed);
      return this.moveBy(
        dx / dist * sp,
        dy / dist * sp,
        dz / dist * sp,
      );
    } else {
      return this.moveTo(x, y, z);
    }
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
