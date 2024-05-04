export interface IKeyboard {
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
