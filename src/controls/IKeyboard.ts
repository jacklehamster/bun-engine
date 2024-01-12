import { Core } from "core/Core";
import { Auxiliary } from "world/aux/Auxiliary";
import { Holder } from "world/aux/Holder";

export interface IKeyboard extends Holder<IKeyboard>, Auxiliary<Core> {
  readonly keys: Record<string, number>;
  readonly keysUp: Record<string, number>;
  addListener(listener: KeyListener): () => void;
  removeListener(listener: KeyListener): void;
}

export interface KeyListener {
  readonly onKeyDown?: (keyCode: string, time: number) => void;
  readonly onKeyUp?: (keyCode: string, time: number) => void;
  readonly onQuickTap?: (keyCode: string, time: number) => void;
}
