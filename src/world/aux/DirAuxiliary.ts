import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";

interface Props {
  controls: IControls;
}

export class DirAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private dx: number = 0;
  constructor({ controls }: Props, private onFlip?: (dx: number) => void) {
    this.controls = controls;
  }

  private checkControls(controls: IControls) {
    let dx = 0;
    if (controls.left) {
      dx--;
    }
    if (controls.right) {
      dx++;
    }
    if (dx && dx !== this.dx) {
      this.dx = dx;
      this.onFlip?.(this.dx);
    }
  }

  onAction(controls: IControls) {
    this.checkControls(controls);
  }

  onActionUp(controls: IControls) {
    this.checkControls(controls);
  }

  activate(): void {
    this.controls.addListener(this)
  }

  deactivate(): void {
    this.controls.removeListener(this);
  }
}
