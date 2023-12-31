import { IKeyboard } from "controls/IKeyboard";
import { Auxiliary } from "./Auxiliary";
import { UpdatePayload } from "updates/Refresh";
import { List, map } from "world/sprite/List";

type KeyMap = { key: string; aux: Auxiliary };

interface Config {
  auxiliariesMapping: List<KeyMap>;
}

interface Props {
  keyboard: IKeyboard;
}

export class ToggleAuxiliary implements Auxiliary {
  private keyboard: IKeyboard;
  private active: boolean = false;
  private toggleIndex: number = 0;
  private pendingDeactivate?: (() => void) | void;
  private keys: (string | undefined)[];
  private auxiliaries: List<Auxiliary>;

  constructor({ keyboard }: Props, config: Config) {
    this.keyboard = keyboard;
    this.keys = map(config.auxiliariesMapping, (({ key }) => key));
    this.keyboard.addListener({
      onKeyDown: (keyCode: string) => {
        if (this.keys.indexOf(keyCode) >= 0) {
          const wasActive = this.active;
          this.deactivate();
          this.toggle(keyCode);
          if (wasActive) {
            this.activate();
          }
        }
      },
    });
    this.auxiliaries = map(config.auxiliariesMapping, (({ aux }) => aux));
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

  refresh(updatePayload: UpdatePayload): void {
    this.auxiliary?.refresh?.(updatePayload);
  }

  activate(): (() => void) | void {
    if (!this.active) {
      this.active = true;
      this.pendingDeactivate = this.auxiliary?.activate?.();
    }
  }

  deactivate(): void {
    if (this.active) {
      this.active = false;
      this.pendingDeactivate?.();
      this.auxiliary?.deactivate?.();
    }
  }
}
