import { PositionMatrix } from "gl/transform/PositionMatrix";
import { Auxiliary } from "./Auxiliary";
import { Flippable } from "world/sprite/Sprite";
import { IControls } from "controls/IControls";

interface Props {
  flippable: Flippable;
  controls: IControls;
}

export class DirAuxiliary implements Auxiliary<PositionMatrix> {
  private flippable: Flippable;
  private controls: IControls;
  private dx: number = 0;
  constructor({ flippable, controls }: Props, private onChange?: () => void) {
    this.flippable = flippable;
    this.controls = controls;
  }

  onAction(controls: IControls) {
    let dx = 0;
    if (controls.left) {
      dx--;
    }
    if (controls.right) {
      dx++;
    }
    if (dx && dx !== this.dx) {
      this.dx = dx;
      this.flippable.flip = this.dx < 0;
      this.onChange?.();
    }
  }

  activate(): void {
    this.controls.addListener(this)
  }

  deactivate(): void {
    this.controls.removeListener(this);
  }
}
