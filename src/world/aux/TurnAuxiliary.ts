import { UpdatePayload, IMotor } from "motor-loop";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { ControlledLooper } from "updates/ControlledLooper";

interface Props {
  controls: IControls;
  turn: TurnMatrix;
  motor: IMotor;
}

interface Data {
  controls: IControls;
  turn: TurnMatrix;
}

export class TurnAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  constructor({ controls, turn, motor }: Props) {
    super(motor, controls, ({ turnLeft, turnRight }) => turnLeft || turnRight, { controls, turn });
  }

  refresh({ data: { controls, turn }, deltaTime, stopUpdate }: UpdatePayload<Data>): void {
    const { turnLeft, turnRight } = controls;
    const turnspeed = deltaTime / 400;
    if (turnLeft) {
      turn.angle.addValue(-turnspeed);
    }
    if (turnRight) {
      turn.angle.addValue(turnspeed);
    }
    if (!turnLeft && !turnRight) {
      stopUpdate();
    }
  }
}
