import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";

interface Props {
  controls: IControls;
  tilt: TiltMatrix;
}

export class TiltAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly tilt: IAngleMatrix;

  constructor(props: Props) {
    this.controls = props.controls;
    this.tilt = props.tilt;
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
