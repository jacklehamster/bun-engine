import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { IAngleMatrix, angleStep } from "dok-matrix";
import { IMotor, UpdatePayload } from "motor-loop";
import { ControlledLooper } from "updates/ControlledLooper";

interface Props {
  motor: IMotor;
  controls: IControls;
  turn: IAngleMatrix;
}

interface Config {
  step: number;
}

interface Data {
  controls: IControls;
  turn: IAngleMatrix;
  step: number;
}

export class TurnStepAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  private turnCount: number = 0;

  constructor({ controls, turn, motor }: Props, config: Partial<Config> = {}) {
    super(motor, controls, controls => controls.turnLeft || controls.turnRight, { controls, turn, step: config.step ?? Math.PI / 2 });
  }

  refresh({ deltaTime, data, stopUpdate }: UpdatePayload<Data>): void {
    const { turnLeft, turnRight } = data.controls;

    let dTurn = 0;
    if (turnLeft) {
      dTurn--;
    }
    if (turnRight) {
      dTurn++;
    }

    const { step } = data;
    const turnAngleVal = data.turn.angle;
    const turn = angleStep(turnAngleVal.valueOf(), step);
    if (dTurn || this.turnCount > 0) {
      turnAngleVal.progressTowards(
        angleStep(turn + step * dTurn, step),
        dTurn ? 1 / 200 : 1 / 100, this);
    }
    if (!dTurn) {
      this.turnCount = 0;
    }
    if (turnAngleVal.update(deltaTime)) {
      const newTurn = angleStep(turnAngleVal.valueOf(), step);
      if (newTurn !== turn) {
        this.turnCount++;
      }
    } else {
      stopUpdate();
    }
  }
}
