import { UserInterface } from 'ui/UserInterface';
import { Listener } from '../Listener';
import { DialogData } from '../model/ui/DialogData';
import { MenuData } from '../model/ui/MenuData';

export class PopupManager implements UserInterface {
  #popups: string[] = [];

  constructor(private listeners: Set<Listener>) {
  }

  addControlsLock(uid: string): void {
    this.#popups.push(uid);
    this.listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  removeControlsLock(uid: string): void {
    this.#popups = this.#popups.filter(id => id !== uid);
    this.listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  openDialog(dialog: DialogData): Promise<void> {
    throw new Error("Not implemented");
  }
  openMenu(menu: MenuData): Promise<void> {
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
