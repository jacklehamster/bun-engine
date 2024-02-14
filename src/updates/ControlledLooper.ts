import { Cycle, IMotor, Looper } from "motor-loop";
import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";

export class ControlledLooper<T = undefined> extends Looper<T> implements ControlsListener {
  #listener: ControlsListener;
  constructor(motor: IMotor, private readonly controls: IControls, private triggerred: (controls: IControls) => boolean, data: T, cycle?: Cycle<T>) {
    super({ motor, data, cycle }, { autoStart: false });
    this.#listener = this;
  }

  onAction(controls: IControls): void {
    if (this.triggerred(controls)) {
      this.start();
    }
  }

  activate(): void {
    super.activate();
    this.controls.addListener(this.#listener);
  }

  deactivate(): void {
    this.controls.removeListener(this.#listener);
    super.deactivate();
  }
}
