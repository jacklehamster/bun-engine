import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";

interface Props {
  controls: IControls;
}

export class MotionAuxiliary implements ControlsListener {
  readonly #controls: IControls;
  #moving: boolean = false;

  constructor({ controls }: Props, private onChange?: (moving: boolean) => void) {
    this.#controls = controls;
  }

  set moving(value: boolean) {
    if (this.#moving !== value) {
      this.#moving = value;
      this.onChange?.(this.#moving);
    }
  }

  private checkMotion(controls: IControls) {
    const { left, forward, backward, right } = controls;
    this.moving = left || forward || backward || right;
  }

  onAction(controls: IControls) {
    this.checkMotion(controls);
  }

  onActionUp(controls: IControls) {
    this.checkMotion(controls);
  }

  activate(): void {
    this.#controls.addListener(this)
  }

  deactivate(): void {
    this.moving = false;
    this.#controls.removeListener(this);
  }
}
