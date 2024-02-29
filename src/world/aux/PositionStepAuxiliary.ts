import { UpdatePayload, IMotor } from "motor-loop";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { MoveResult } from "dok-matrix";
import { NumVal } from "progressive-value";
import { ControlledLooper } from "updates/ControlledLooper";
import { PositionStep } from "./PositionStep";

interface Props {
  controls: IControls;
  positionStep: PositionStep;
  turnGoal?: NumVal;
  motor: IMotor;
}

interface Config {
  step: number;
  speed: number;
  airBoost: number;
}

interface Data {
  controls: IControls;
  positionStep: PositionStep;
  turnGoal?: NumVal;
  step: number;
  speed: number;
  airBoost: number;
}

export class PositionStepAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  constructor({ controls, positionStep, turnGoal, motor }: Props, config: Partial<Config> = {}) {
    super(motor, controls, ({ backward, forward, left, right }) => backward || forward || left || right,
      { controls, positionStep, turnGoal, step: config.step ?? 2, speed: config.speed ?? 1, airBoost: config?.airBoost ?? 1 });
  }

  refresh({ deltaTime, data, stopUpdate }: UpdatePayload<Data>): void {
    const { backward, forward, left, right } = data.controls;

    const { step, airBoost, positionStep } = data;

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

    let speed = ((dx || dz) ? deltaTime / 150 : deltaTime / 100) * data.speed;
    if (data.positionStep.position[1] > 0) {
      speed *= airBoost;
    }
    const cos = Math.cos(turnGoal);
    const sin = Math.sin(turnGoal);
    const relativeDx = dx * cos - dz * sin;
    const relativeDz = dx * sin + dz * cos;
    const moveResult = positionStep.cellMoveBy(relativeDx, 0, relativeDz, step, speed);

    if (moveResult === MoveResult.AT_POSITION) {
      stopUpdate();
    }
  }
}
