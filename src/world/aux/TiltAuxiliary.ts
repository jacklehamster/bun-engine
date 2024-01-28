import { UpdatePayload } from "motor/update/UpdatePayload";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "updates/ControlledLooper";

interface Props {
  controls: IControls;
  tilt: TiltMatrix;
  motor: IMotor;
}

interface Data {
  controls: IControls;
  tilt: TiltMatrix;
}

export class TiltAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  constructor({ controls, tilt, motor }: Props) {
    super(motor, controls, ({ up, down }) => up || down, { controls, tilt });
  }

  refresh({ data: { controls, tilt }, deltaTime, motor, refresher }: UpdatePayload<Data>): void {
    const { up, down } = controls;
    const turnspeed = deltaTime / 400;
    if (up) {
      tilt.angle.addValue(-turnspeed);
    }
    if (down) {
      tilt.angle.addValue(turnspeed);
    }
    if (!up && !down) {
      motor.stopUpdate(refresher);
    }
  }
}
