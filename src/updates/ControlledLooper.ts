import { Refresh } from "motor/update/Refresh";
import { IMotor } from "../motor/IMotor";
import { Looper } from "../motor/Looper";
import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";

export class ControlledLooper<T = undefined> extends Looper<T> implements ControlsListener {
  private _listener: ControlsListener;
  constructor(motor: IMotor, private readonly controls: IControls, private triggerred: (controls: IControls) => boolean, data: T, refresher?: Refresh<T>) {
    super(motor, false, data, refresher);
    this._listener = this;
  }

  onAction(controls: IControls): void {
    if (this.triggerred(controls)) {
      this.start();
    }
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
