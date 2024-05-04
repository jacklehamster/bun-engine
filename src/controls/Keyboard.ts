import { Time, IMotor } from "motor-loop";
import { IKeyboard, KeyListener } from "./IKeyboard";
import { Active } from "dok-types";

const QUICK_TAP_TIME = 200;

interface Props {
  motor: IMotor;
}

export class Keyboard implements IKeyboard, Active {
  readonly keys: Record<string, Time> = {};
  readonly keysUp: Record<string, Time> = {};

  private readonly keyDownListener = new Set<KeyListener>();
  private readonly keyUpListener = new Set<KeyListener>();
  private readonly quickTapListener = new Set<KeyListener>();
  private readonly timeProvider: IMotor;

  isActive: boolean = false;

  constructor({ motor }: Props) {
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
    this.timeProvider = motor;
  }

  private keyDown(e: KeyboardEvent): void {
    if (!this.keys[e.code]) {
      const time = this.timeProvider.time;
      this.keys[e.code] = time;
      this.keyDownListener.forEach(listener => listener.onKeyDown?.(e.code, time));
    }
    e.preventDefault();
  }

  private keyUp(e: KeyboardEvent) {
    const quickTap = this.timeProvider.time - this.keys[e.code] < QUICK_TAP_TIME;
    this.keysUp[e.code] = this.timeProvider.time;
    this.keys[e.code] = 0;
    this.keyUpListener.forEach(listener => listener.onKeyUp?.(e.code, this.timeProvider.time))
    if (quickTap) {
      this.quickTapListener.forEach(listener => listener.onQuickTap?.(e.code, this.timeProvider.time))
    }
  }

  activate(): void {
    if (!this.isActive) {
      this.isActive = true;
      document.addEventListener('keydown', this.keyDown);
      document.addEventListener('keyup', this.keyUp);
    }
  }

  deactivate(): void {
    if (this.isActive) {
      document.removeEventListener('keydown', this.keyDown);
      document.removeEventListener('keyup', this.keyUp);
      this.isActive = false;
    }
  }

  addListener(listener: KeyListener): () => void {
    if (listener.onKeyDown) {
      this.keyDownListener.add(listener);
    }
    if (listener.onKeyUp) {
      this.keyUpListener.add(listener);
    }
    if (listener.onQuickTap) {
      this.quickTapListener.add(listener);
    }
    return () => {
      this.removeListener(listener);
    };
  }

  removeListener(listener: KeyListener): void {
    this.keyDownListener.delete(listener);
    this.keyUpListener.delete(listener);
    this.quickTapListener.delete(listener);
  }
}
