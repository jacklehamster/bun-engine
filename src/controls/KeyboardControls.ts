import { StateEnum, ControlsListener, IControls } from "./IControls";
import { IKeyboard } from "./IKeyboard";

export class KeyboardControls implements IControls {
  private onRemoveListener: Map<ControlsListener, () => void> = new Map();

  constructor(private keyboard: IKeyboard) {
  }

  addListener(listener: ControlsListener): void {
    const onRemove = this.keyboard.addListener({
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
      onKeyDown: () => listener.onAction?.(this, StateEnum.PRESS_DOWN),
      onKeyUp: () => listener.onAction?.(this, StateEnum.PRESS_UP),
    });
    this.onRemoveListener.set(listener, onRemove);
  }

  removeListener(listener: ControlsListener): void {
    this.onRemoveListener.get(listener)?.();
    this.onRemoveListener.delete(listener);
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
