import { IControls } from "./IControls";
import { ControlsListener } from "./ControlsListener";
import { IKeyboard, KeyListener } from "./IKeyboard";
import { Time } from "motor-loop";

export class KeyboardControls implements IControls, KeyListener {
  readonly #listeners = new Set<ControlsListener>();
  private keys: Record<string, Time> = {}
  #enabled = false;

  constructor(private readonly keyboard: IKeyboard) {
  }

  setEnabled(enabled: boolean) {
    if (this.#enabled === enabled) {
      return;
    }
    this.#enabled = enabled;
    this.keys = enabled ? this.keyboard.keys : {};
    if (enabled) {
      this.keyboard.addListener(this);
    } else {
      this.onActionUp();
      this.keyboard.removeListener(this);
    }
  }

  onQuickTap(keyCode: string): void {
    switch (keyCode) {
      case 'Space':
        this.#listeners.forEach(listener => listener.onQuickAction?.());
        break;
      case 'ShiftRight':
        this.#listeners.forEach(listener => listener.onQuickTiltReset?.());
        break;
    }
  }

  onKeyDown(_keyCode: string, _time: number): void {
    this.onAction();
  }

  onKeyUp(_keyCode: string, _time: number): void {
    this.onActionUp();
  }

  onAction() {
    this.#listeners.forEach(listener => listener.onAction?.(this));
  }

  onActionUp() {
    this.#listeners.forEach(listener => listener.onAction?.(this));
  }

  addListener(listener: ControlsListener): void {
    this.#listeners.add(listener);
  }

  removeListener(listener: ControlsListener): void {
    this.#listeners.delete(listener);
  }

  get forward(): boolean {
    const { keys } = this;
    return !!(keys.KeyW || (keys.ArrowUp && !keys.ShiftRight));
  }

  get backward(): boolean {
    const { keys } = this;
    return !!(keys.KeyS || (keys.ArrowDown && !keys.ShiftRight));
  }

  get left(): boolean {
    const { keys } = this;
    return !!(keys.KeyA || (keys.ArrowLeft && !keys.ShiftRight));
  }

  get right(): boolean {
    const { keys } = this;
    return !!(keys.KeyD || (keys.ArrowRight && !keys.ShiftRight));
  }

  get turnLeft(): boolean {
    const { keys } = this;
    return !!(keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight));
  }

  get turnRight(): boolean {
    const { keys } = this;
    return !!(keys.KeyE || (keys.ArrowRight && keys.ShiftRight));
  }

  get up(): boolean {
    const { keys } = this;
    return !!(keys.ArrowUp && keys.ShiftRight);
  }

  get down(): boolean {
    const { keys } = this;
    return !!(keys.ArrowDown && keys.ShiftRight);
  }

  get action(): boolean {
    const { keys } = this;
    return !!(keys.Space);
  }

  get exit(): boolean {
    const { keys } = this;
    return !!(keys.Escape);
  }
}
