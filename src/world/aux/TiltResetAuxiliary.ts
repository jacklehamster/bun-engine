import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { ControlsListener, IControls } from "controls/IControls";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { Looper } from "motor/Looper";
import { IMotor } from "motor/IMotor";

interface Props {
  motor: IMotor;
  controls: IControls;
  tilt: IAngleMatrix;
}

export class TiltResetAuxiliary extends Looper implements Auxiliary {
  private readonly controls: IControls;
  private readonly tilt: IAngleMatrix;
  private readonly listener: ControlsListener = {
    onQuickTiltReset: () => {
      this.start();
      this.tilt.angle.progressTowards(0, 1 / 300, this);
    },
  };

  constructor({ controls, tilt, motor }: Props) {
    super(motor, false);
    this.controls = controls;
    this.tilt = tilt;
  }

  activate(): void | (() => void) {
    super.activate();
    this.controls.addListener(this.listener);
  }

  deactivate(): void {
    this.controls.removeListener(this.listener);
    super.deactivate();
  }

  refresh(update: UpdatePayload): void {
    const { deltaTime } = update;
    if (!this.tilt.angle.update(deltaTime)) {
      this.stop();
    }
  }
}
