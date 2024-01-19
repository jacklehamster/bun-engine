import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { Looper } from "motor/Looper";
import { IMotor } from "motor/IMotor";

interface Props {
  controls: IControls;
  tilt: TiltMatrix;
  motor: IMotor;
}

export class TiltAuxiliary extends Looper implements Auxiliary {
  private readonly controls: IControls;
  private readonly tilt: IAngleMatrix;

  constructor({ controls, tilt, motor }: Props) {
    super(motor, true);
    this.controls = controls;
    this.tilt = tilt;
  }

  refresh(update: UpdatePayload): void {
    const { up, down } = this.controls;
    const { deltaTime } = update;
    const turnspeed = deltaTime / 400;
    if (up) {
      this.tilt.angle.addValue(-turnspeed);
    }
    if (down) {
      this.tilt.angle.addValue(turnspeed);
    }
  }
}
