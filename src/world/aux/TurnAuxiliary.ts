import { UpdatePayload, IMotor } from "motor-loop";
import { IControls } from "controls/IControls";
import { ControlledLooper } from "updates/ControlledLooper";
import { IAngleMatrix } from "dok-matrix";

interface Props {
  controls: IControls;
  turn: IAngleMatrix;
  motor: IMotor;
}

interface Data {
  controls: IControls;
  turn: IAngleMatrix;
}

export class TurnAuxiliary extends ControlledLooper<Data> {
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
