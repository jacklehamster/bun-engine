import { UserInterface } from '../UserInterface';
import { PopupListener } from './PopupListener';
import { DialogData } from '../dialog/DialogData';
import { MenuData } from '../menu/MenuData';

export class PopupManager implements UserInterface {
  #popups: string[] = [];
  #listeners: Set<PopupListener>;

  constructor(listeners: Set<PopupListener>) {
    this.#listeners = listeners;
  }

  addControlsLock(uid: string): void {
    this.#popups.push(uid);
    this.#listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  removeControlsLock(uid: string): void {
    this.#popups = this.#popups.filter(id => id !== uid);
    this.#listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  openDialog(_dialog: DialogData): Promise<void> {
    throw new Error("Not implemented");
  }
  openMenu(_menu: MenuData): Promise<void> {
    throw new Error("Not implemented");
  }
  closePopup(): void {
    throw new Error("Not implemented");
  }
  nextMessage(): void {
    throw new Error("Not implemented");
  }
  selection: number = 0;
}
