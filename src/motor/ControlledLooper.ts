import { Refresh } from "updates/Refresh";
import { IMotor } from "./IMotor";
import { Looper } from "./Looper";
import { ControlsListener, IControls } from "controls/IControls";

export class ControlledLooper<T = undefined> extends Looper<T> {
  private _listener: ControlsListener;
  constructor(motor: IMotor, private readonly controls: IControls, triggerred: (controls: IControls) => boolean, data?: T, refresher?: Refresh<T>) {
    super(motor, false, data, refresher);
    this._listener = {
      onAction: (controls): void => {
        if (triggerred(controls)) {
          this.start();
        }
      },
    };
  }

  activate(): void {
    super.activate();
    this.controls.addListener(this._listener);
  }

  deactivate(): void {
    this.controls.removeListener(this._listener);
    super.deactivate();
  }
}
