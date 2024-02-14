import { UpdatePayload, IMotor } from "motor-loop";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { ControlledLooper } from "updates/ControlledLooper";
import { IAngleMatrix } from "dok-matrix";

interface Props {
  controls: IControls;
  tilt: IAngleMatrix;
  motor: IMotor;
}

interface Data {
  controls: IControls;
  tilt: IAngleMatrix;
}

export class TiltAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  constructor({ controls, tilt, motor }: Props) {
    super(motor, controls, ({ up, down }) => up || down, { controls, tilt });
  }

  refresh({ data: { controls, tilt }, deltaTime, stopUpdate }: UpdatePayload<Data>): void {
    const { up, down } = controls;
    const turnspeed = deltaTime / 400;
    if (up) {
      tilt.angle.addValue(-turnspeed);
    }
    if (down) {
      tilt.angle.addValue(turnspeed);
    }
    if (!up && !down) {
      stopUpdate();
    }
  }
}
