import { ITimeProvider, Time } from "core/Time";
import { IKeyboard, KeyListener } from "./IKeyboard";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";

const QUICK_TAP_TIME = 200;

export class Keyboard extends AuxiliaryHolder<IKeyboard> implements IKeyboard {
  readonly keys: Record<string, Time> = {};
  readonly keysUp: Record<string, Time> = {};

  private readonly keyDownListener = new Set<KeyListener>();
  private readonly keyUpListener = new Set<KeyListener>();
  private readonly quickTapListener = new Set<KeyListener>();

  private isActive: boolean = false;

  constructor(private timeProvider: ITimeProvider) {
    super();
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
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
    super.activate();
    this.setActive(true);
  }

  deactivate(): void {
    super.deactivate();
    this.setActive(false);
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
