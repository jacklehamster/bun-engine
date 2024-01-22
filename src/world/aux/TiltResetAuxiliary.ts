import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { IMotor } from "motor/IMotor";

interface Props {
  motor: IMotor;
  controls: IControls;
  tilt: IAngleMatrix;
}

export class TiltResetAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly listener: ControlsListener;

  constructor({ controls, tilt, motor }: Props) {
    this.listener = {
      onQuickTiltReset: () => {
        tilt.angle.progressTowards(0, 1 / 300, this, motor);
      },
    }
    this.controls = controls;
  }

  activate(): void | (() => void) {
    this.controls.addListener(this.listener);
  }

  deactivate(): void {
    this.controls.removeListener(this.listener);
  }
}
