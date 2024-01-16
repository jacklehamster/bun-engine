import { ControlsListener, IControls } from "./IControls";
import { IKeyboard } from "./IKeyboard";

export class KeyboardControls implements IControls {
  constructor(private keyboard: IKeyboard) {
  }

  addListener(listener: ControlsListener): () => void {
    return this.keyboard.addListener({
      onQuickTap(keyCode) {
        switch (keyCode) {
          case 'Space':
            listener.onQuickAction?.();
            break;
          case 'ShiftRight':
            listener.onQuickTiltReset?.();
            break;
        }
      },
      onKeyDown: () => listener.onAction?.(this),
    });
  }

  removeListener(listener: ControlsListener): void {
    throw new Error("Not implemented");
  }

  get forward(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.KeyW || (keys.ArrowUp && !keys.ShiftRight));
  }

  get backward(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.KeyS || (keys.ArrowDown && !keys.ShiftRight));
  }

  get left(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.KeyA || (keys.ArrowLeft && !keys.ShiftRight));
  }

  get right(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.KeyD || (keys.ArrowRight && !keys.ShiftRight));
  }

  get turnLeft(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight));
  }

  get turnRight(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.KeyE || (keys.ArrowRight && keys.ShiftRight));
  }

  get up(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.ArrowUp && keys.ShiftRight);
  }

  get down(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.ArrowDown && keys.ShiftRight);
  }

  get action(): boolean {
    const { keys } = this.keyboard;
    return !!(keys.Space);
  }
}
