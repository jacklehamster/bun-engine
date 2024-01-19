import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "motor/ControlLooper";

interface Props {
  controls: IControls;
  tilt: TiltMatrix;
  motor: IMotor;
}

export class TiltAuxiliary extends ControlledLooper implements Auxiliary {
  private readonly tilt: IAngleMatrix;

  constructor({ controls, tilt, motor }: Props) {
    super(motor, controls, ({ up, down }) => up || down);
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
    if (!up && !down) {
      this.stop();
    }
  }
}
