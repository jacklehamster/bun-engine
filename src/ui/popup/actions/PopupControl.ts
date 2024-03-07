import { PopupControlListener } from "./PopupControlListener";

export class PopupControl implements PopupControlListener {
  #listeners = new Set<PopupControlListener>();

  onUp(): void {
    for (const listener of this.#listeners) {
      listener.onUp?.();
    }
  }

  onDown(): void {
    for (const listener of this.#listeners) {
      listener.onDown?.();
    }
  }

  onAction(): void {
    for (const listener of this.#listeners) {
      listener.onAction?.();
    }
  }

  addListener(listener: PopupControlListener): void {
    this.#listeners.add(listener);
  }

  removeListener(listener: PopupControlListener): void {
    this.#listeners.delete(listener);
  }
}
