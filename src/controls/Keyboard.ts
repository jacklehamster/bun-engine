import { ITimeProvider, Time } from "core/Time";
import { IKeyboard, KeyListener } from "./IKeyboard";

const QUICK_TAP_TIME = 200;

interface Props {
  timeProvider: ITimeProvider;
}

export class Keyboard implements IKeyboard {
  readonly keys: Record<string, Time> = {};
  readonly keysUp: Record<string, Time> = {};

  private readonly keyListener = new Set<KeyListener>();
  private isActive: boolean = false;
  private readonly timeProvider: ITimeProvider;

  constructor({ timeProvider }: Props) {
    this.timeProvider = timeProvider;
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
  }

  private keyDown(e: KeyboardEvent): void {
    if (!this.keys[e.code]) {
      this.keys[e.code] = this.timeProvider.time;
      this.keyListener.forEach(listener => listener.onKeyDown?.(e.code))
    }
  }

  private keyUp(e: KeyboardEvent) {
    if (this.timeProvider.time - this.keys[e.code] < QUICK_TAP_TIME) {
      this.keysUp[e.code] = this.keysUp[e.code] ? 0 : this.timeProvider.time;
    } else {
      this.keysUp[e.code] = 0;
    }
    this.keys[e.code] = 0;
    this.keyListener.forEach(listener => listener.onKeyUp?.(e.code))
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
