import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";
import { NumVal } from "core/value/NumVal";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "motor/ControlLooper";
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

export class PositionStepAuxiliary extends ControlledLooper implements Auxiliary {
  private readonly goalPos: Vector;
  private readonly position: IPositionMatrix;
  private readonly turnGoal?: NumVal;
  private stepCount: number = 0;
  private config: Config;

  constructor({ controls, position, turnGoal, motor }: Props, config: Partial<Config> = {}) {
    super(motor, controls, ({ backward, forward, left, right }) => backward || forward || left || right);
    this.position = position;
    this.turnGoal = turnGoal;
    this.goalPos = [
      this.position.position[0],
      this.position.position[1],
      this.position.position[2],
    ];
    this.config = {
      step: config.step ?? 2,
      speed: config.speed ?? 1,
    };
  }

  private readonly prePos: Vector = [0, 0, 0];
  refresh(update: UpdatePayload): void {
    const { backward, forward, left, right } = this.controls;
    const { deltaTime } = update;

    const pos = this.position.position;
    const { step } = this.config;
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
    const turnGoal = this.turnGoal?.goal ?? 0;
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
    const speed = ((dx || dz) ? deltaTime / 150 : deltaTime / 100) * this.config.speed;

    const didMove = this.position.gotoPos(this.goalPos[0], pos[1], this.goalPos[2], speed)
      || this.position.gotoPos(this.goalPos[0], pos[1], pos[2], speed)
      || this.position.gotoPos(pos[0], pos[1], this.goalPos[2], speed);
    if (!didMove) {
      const gx = Math.round(pos[0] / step) * step;
      const gz = Math.round(pos[2] / step) * step;
      this.goalPos[0] = gx;
      this.goalPos[2] = gz;
    }
    const newPos = this.position.position;
    if (Math.round(newPos[0] / step) * step !== this.prePos[0]
      || Math.round(newPos[1] / step) * step !== this.prePos[1]
      || Math.round(newPos[2] / step) * step !== this.prePos[2]) {
      this.stepCount++;
    }
    if (!dx && !dz && equal(newPos, this.goalPos)) {
      this.stop();
    }
  }
}
