import { UpdatePayload } from "motor/update/UpdatePayload";
import { Auxiliary } from "./Auxiliary";
import { angleStep } from "gl/utils/angleUtils";
import { IControls } from "controls/IControls";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "motor/ControlledLooper";

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
    const turn = angleStep(data.turn.angle.valueOf(), step);
    if (dTurn || this.turnCount > 0) {
      data.turn.angle.progressTowards(
        angleStep(turn + step * dTurn, step),
        dTurn ? 1 / 200 : 1 / 100, this);
    }
    if (!dTurn) {
      this.turnCount = 0;
    }
    if (data.turn.angle.update(deltaTime)) {
      const newTurn = angleStep(data.turn.angle.valueOf(), step);
      if (newTurn !== turn) {
        this.turnCount++;
      }
    } else {
      stopUpdate();
    }
  }
}
