import { Refresh } from "updates/Refresh";
import { IMotor } from "./IMotor";
import { Looper } from "./Looper";
import { ControlsListener, IControls, StateEnum } from "controls/IControls";

export class ControlledLooper extends Looper {
  private listener: ControlsListener;
  constructor(motor: IMotor, protected readonly controls: IControls, trigger: (controls: IControls) => boolean, refresher?: Refresh) {
    super(motor, false, refresher);
    this.listener = {
      onAction: (controls, state): void => {
        if (state === StateEnum.PRESS_DOWN) {
          if (trigger(controls)) {
            this.start();
          }
        }
      },
    };
  }

  activate(): void {
    super.activate();
    this.controls.addListener(this.listener);
  }

  deactivate(): void {
    this.controls.removeListener(this.listener);
    super.deactivate();
  }
}
