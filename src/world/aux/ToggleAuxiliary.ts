import { IKeyboard, KeyListener } from "controls/IKeyboard";
import { Auxiliary } from "./Auxiliary";
import { List, map } from "abstract-list";

type KeyMap = { key: string; aux: Auxiliary };

interface Config {
  initialIndex?: number;
  auxiliariesMapping: List<KeyMap>;
}

export class ToggleAuxiliary implements Auxiliary<IKeyboard> {
  private keyboard?: IKeyboard;
  private active: boolean = false;
  private toggleIndex: number;
  private readonly keys: (string | undefined)[];
  private readonly auxiliaries: List<Auxiliary>;
  private readonly keyListener: KeyListener;

  constructor(config: Config) {
    this.keys = map(config.auxiliariesMapping, (keyMap => keyMap?.key));
    this.keyListener = {
      onKeyDown: (keyCode: string) => {
        if (this.keys.indexOf(keyCode) >= 0) {
          const wasActive = this.active;
          this.auxiliary?.deactivate?.();
          this.toggle(keyCode);
          if (wasActive) {
            this.auxiliary?.activate?.();
          }
        }
      },
    };
    this.auxiliaries = map(config.auxiliariesMapping, ((keyMap) => keyMap?.aux));
    this.toggleIndex = (config.initialIndex ?? 0);
  }

  set holder(keyboard: IKeyboard) {
    this.keyboard = keyboard;
  }

  private get auxiliary(): Auxiliary | undefined {
    return this.auxiliaries.at(this.toggleIndex);
  }

  toggle(key: string) {
    if (this.keys[this.toggleIndex] !== key) {
      this.toggleIndex = this.keys.indexOf(key);
    } else {
      const nextIndex = this.keys.length ? (this.toggleIndex + 1) % this.keys.length : 0;
      if (this.keys[nextIndex] === key) {
        this.toggleIndex = nextIndex;
      }
    }
  }

  activate(): void {
    if (!this.active) {
      this.active = true;
      this.keyboard?.addListener(this.keyListener);
      this.auxiliary?.activate?.();
    }
  }

  deactivate(): void {
    if (this.active) {
      this.active = false;
      this.keyboard?.removeListener(this.keyListener);
      this.auxiliary?.deactivate?.();
    }
  }
}
