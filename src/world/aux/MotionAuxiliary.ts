import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";

interface Props {
  controls: IControls;
}

export class MotionAuxiliary implements Auxiliary, ControlsListener {
  private readonly controls: IControls;
  private _moving: boolean = false;
  constructor({ controls }: Props, private onChange?: (moving: boolean) => void) {
    this.controls = controls;
  }

  set moving(value: boolean) {
    if (this._moving !== value) {
      this._moving = value;
      this.onChange?.(this._moving);
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
    this.controls.addListener(this)
  }

  deactivate(): void {
    this.moving = false;
    this.controls.removeListener(this);
  }
}
