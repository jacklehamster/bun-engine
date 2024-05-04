import { IKeyboard, KeyListener } from "controls/IKeyboard";
import { List, map } from "abstract-list";
import { Active } from "dok-types";

type KeyMap = { key: string; aux: AuxFactory };

interface Config {
  initialIndex?: number;
  auxiliariesMap: List<KeyMap>;
}

interface Props {
  keyboard: IKeyboard;
}

export type AuxFactory = () => Active;

export class ToggleAuxiliary implements Active {
  #active: boolean = false;
  #toggleIndex: number;
  #auxiliary: Active = {};
  readonly #keyboard: IKeyboard;
  readonly #keys: (string | undefined)[];
  readonly #auxiliaryFactories: List<AuxFactory>;
  readonly #keyListener: KeyListener;

  constructor({ keyboard }: Props, config: Config) {
    this.#keyboard = keyboard;
    this.#keys = map(config.auxiliariesMap, (keyMap => keyMap?.key));
    this.#keyListener = {
      onKeyDown: (keyCode: string) => {
        if (this.#keys.indexOf(keyCode) >= 0) {
          const wasActive = this.#active;
          this.#auxiliary.deactivate?.();
          this.toggle(keyCode);
          this.#auxiliary = this.#auxiliaryFactories.at(this.#toggleIndex)?.() ?? {};
          if (wasActive) {
            this.#auxiliary.activate?.();
          }
        }
      },
    };
    this.#auxiliaryFactories = map(config.auxiliariesMap, ((keyMap) => keyMap?.aux));
    this.#toggleIndex = (config.initialIndex ?? 0);
  }

  toggle(key: string) {
    if (this.#keys[this.#toggleIndex] !== key) {
      this.#toggleIndex = this.#keys.indexOf(key);
    } else {
      const nextIndex = this.#keys.length ? (this.#toggleIndex + 1) % this.#keys.length : 0;
      if (this.#keys[nextIndex] === key) {
        this.#toggleIndex = nextIndex;
      }
    }
  }

  activate(): void {
    if (!this.#active) {
      this.#active = true;
      this.#keyboard.addListener(this.#keyListener);
      this.#auxiliary = this.#auxiliaryFactories.at(this.#toggleIndex)?.() ?? {};
      this.#auxiliary.activate?.();
    }
  }

  deactivate(): void {
    if (this.#active) {
      this.#active = false;
      this.#keyboard.removeListener(this.#keyListener);
      this.#auxiliary.deactivate?.();
    }
  }
}
