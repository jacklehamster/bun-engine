import { UpdatePayload } from "motor/update/UpdatePayload";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";
import { NumVal } from "core/value/NumVal";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "motor/ControlledLooper";
import { Vector } from "core/types/Vector";
import { equal } from "core/utils/vector-utils";

interface Props {
  controls: IControls;
  position: IPositionMatrix;
  turnGoal?: NumVal;
  motor: IMotor;
}

interface Config {
  step: number;
  speed: number;
}

interface Data {
  controls: IControls;
  position: IPositionMatrix;
  turnGoal?: NumVal;
  step: number;
  speed: number;
}

export class PositionStepAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  private readonly goalPos: Vector;
  private stepCount: number = 0;

  constructor({ controls, position, turnGoal, motor }: Props, config: Partial<Config> = {}) {
    super(motor, controls, ({ backward, forward, left, right }) => backward || forward || left || right,
      { controls, position, turnGoal, step: config.step ?? 2, speed: config.speed ?? 1 });
    this.goalPos = [
      position.position[0],
      position.position[1],
      position.position[2],
    ];
  }

  private readonly prePos: Vector = [0, 0, 0];
  refresh({ deltaTime, data, stopUpdate }: UpdatePayload<Data>): void {
    const { backward, forward, left, right } = data.controls;

    const pos = data.position.position;
    const { step } = data;
    this.prePos[0] = Math.round(pos[0] / step) * step;
    this.prePos[1] = Math.round(pos[1] / step) * step;
    this.prePos[2] = Math.round(pos[2] / step) * step;

    let dx = 0, dz = 0;
    if (forward) {
      dz--;
    }
    if (backward) {
      dz++;
    }
    if (left) {
      dx--;
    }
    if (right) {
      dx++;
    }
    const turnGoal = data.turnGoal?.goal ?? 0;
    if (dx || dz || this.stepCount > 0) {
      const relativeDx = dx * Math.cos(turnGoal) - dz * Math.sin(turnGoal);
      const relativeDz = dx * Math.sin(turnGoal) + dz * Math.cos(turnGoal);

      const gx = Math.round(pos[0] / step + relativeDx) * step;
      const gz = Math.round(pos[2] / step + relativeDz) * step;
      this.goalPos[0] = gx;
      this.goalPos[2] = gz;
    }

    if (!dx && !dz) {
      this.stepCount = 0;
    }
    let speed = ((dx || dz) ? deltaTime / 150 : deltaTime / 100) * data.speed;
    if (data.position.position[1] > 0) {
      speed *= 2;
    }

    const didMove = data.position.gotoPos(this.goalPos[0], pos[1], this.goalPos[2], speed)
      || dx && data.position.gotoPos(this.goalPos[0], pos[1], pos[2], speed)
      || dz && data.position.gotoPos(pos[0], pos[1], this.goalPos[2], speed);
    if (!didMove) {
      const gx = Math.round(pos[0] / step) * step;
      const gz = Math.round(pos[2] / step) * step;
      this.goalPos[0] = gx;
      this.goalPos[2] = gz;
    }
    const newPos = data.position.position;
    if (Math.round(newPos[0] / step) * step !== this.prePos[0]
      || Math.round(newPos[1] / step) * step !== this.prePos[1]
      || Math.round(newPos[2] / step) * step !== this.prePos[2]) {
      this.stepCount++;
    }
    if (!backward && !forward && !left && !right && equal(newPos, this.goalPos)) {
      stopUpdate();
    }
  }
}
