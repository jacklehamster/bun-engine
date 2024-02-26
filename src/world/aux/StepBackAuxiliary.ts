import { IPositionMatrix, MoveResult } from "dok-matrix";
import { Auxiliary } from "./Auxiliary";
import { IMotor, Looper, UpdatePayload } from "motor-loop";
import { Cell, IVisitableCell, toCell } from "cell-tracker";
import { Vector } from "dok-types";
import { GoBack } from "./GoBack";

interface Props {
  position: IPositionMatrix & GoBack;
  motor: IMotor;
}

interface Data {
  position: IPositionMatrix & GoBack;
  speed: number;
  step: number;
}

interface Config {
  step: number;
  speed: number;
}

export class StepBackAuxiliary extends Looper<Data> implements Auxiliary, IVisitableCell {
  #previousCellPos: Vector;
  #curCellPos: Vector;

  constructor({ position, motor }: Props, config: Partial<Config> = {}) {
    super({ motor, data: { position, speed: config.speed ?? 1, step: config.step ?? 2 } }, { autoStart: false });
    position.goBack = () => this.goBack();
    const step = config.step ?? 2;
    this.#curCellPos = [
      toCell(position.position[0], step) * step,
      0,
      toCell(position.position[2], step) * step,
    ];
    this.#previousCellPos = [...this.#curCellPos];
  }

  visitCell(cell: Cell): void {
    if (this.#curCellPos[0] !== cell.pos[0] || this.#curCellPos[2] !== cell.pos[2]) {
      const temp = this.#previousCellPos;
      this.#previousCellPos = this.#curCellPos;
      this.#curCellPos = temp;

      this.#curCellPos[0] = cell.pos[0];
      this.#curCellPos[2] = cell.pos[2];
    }
  }

  goBack() {
    this.#curCellPos[0] = this.#previousCellPos[0];
    this.#curCellPos[2] = this.#previousCellPos[2];
    this.start();
  }

  refresh({ deltaTime, data, stopUpdate }: UpdatePayload<Data>): void {
    const speed = deltaTime / 50 * data.speed;
    let moveResult = data.position.gotoPos(this.#previousCellPos[0] * data.step, this.#previousCellPos[1] * data.step, this.#previousCellPos[2] * data.step, speed);
    if (moveResult !== MoveResult.MOVED) {
      stopUpdate();
    }
  }
}
