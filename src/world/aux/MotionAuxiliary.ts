import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";

interface Props {
  controls: IControls;
}

export class MotionAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private _moving: boolean = false;
  constructor({ controls }: Props, private onChange?: (moving: boolean) => void) {
    this.controls = controls;
  }

  onAction(controls: IControls) {
    const { left, forward, backward, right } = controls;
    const moving = left || forward || backward || right;
    if (this._moving !== moving) {
      this._moving = moving;
      this.onChange?.(this._moving);
    }
  }

  activate(): void {
    this.controls.addListener(this)
  }

  deactivate(): void {
    this._moving = false;
    this.controls.removeListener(this);
  }
}
