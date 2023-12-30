import { Auxiliary } from "world/aux/Auxiliary";

export interface IKeyboard extends Auxiliary {
  readonly keys: Record<string, number>;
  readonly keysUp: Record<string, number>;
  addListener(listener: KeyListener): void;
  removeListener(listener: KeyListener): void;
}

export interface KeyListener {
  onKeyDown?(keyCode: string): void;
  onKeyUp?(keyCode: string): void;
}
