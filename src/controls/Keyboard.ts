import { ITimeProvider, Time } from "core/Time";
import { IKeyboard, KeyListener } from "./IKeyboard";

const QUICK_TAP_TIME = 200;

export class Keyboard implements IKeyboard {
  readonly keys: Record<string, Time> = {};
  readonly keysUp: Record<string, Time> = {};

  private readonly keyListener = new Set<KeyListener>();
  private isActive: boolean = false;

  constructor(private timeProvider: ITimeProvider) {
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
  }

  private keyDown(e: KeyboardEvent): void {
    if (!this.keys[e.code]) {
      this.keys[e.code] = this.timeProvider.time;
      this.keyListener.forEach(listener => listener.onKeyDown?.(e.code, this.timeProvider.time));
    }
    e.preventDefault();
  }

  private keyUp(e: KeyboardEvent) {
    const quickTap = this.timeProvider.time - this.keys[e.code] < QUICK_TAP_TIME;
    this.keysUp[e.code] = this.timeProvider.time;
    this.keys[e.code] = 0;
    this.keyListener.forEach(listener => listener.onKeyUp?.(e.code, this.timeProvider.time))
    if (quickTap) {
      this.keyListener.forEach(listener => listener.onQuickTap?.(e.code, this.timeProvider.time))
    }
  }

  activate(): () => void {
    this.setActive(true);
    return () => this.setActive(false);
  }

  private setActive(value: boolean) {
    if (this.isActive !== value) {
      this.isActive = value;
      document.removeEventListener('keydown', this.keyDown);
      document.removeEventListener('keyup', this.keyUp);
      if (this.isActive) {
        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup', this.keyUp);
      }
    }
  }

  addListener(listener: KeyListener): () => void {
    this.keyListener.add(listener);
    return () => {
      this.removeListener(listener);
    };
  }

  removeListener(listener: KeyListener): void {
    this.keyListener.delete(listener);
  }
}
