import { UserInterface } from 'ui/UserInterface';
import { Listener } from '../Listener';
import { DialogData } from '../dialog/model/DialogData';
import { MenuData } from '../menu/model/MenuData';

export class PopupManager implements UserInterface {
  #popups: string[] = [];

  constructor(private listeners: Set<Listener>) {
    this.addControlsLock = this.addControlsLock.bind(this);
    this.removeControlsLock = this.removeControlsLock.bind(this);
  }

  addControlsLock(uid: string): void {
    this.#popups.push(uid);
    this.listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  removeControlsLock(uid: string): void {
    this.#popups = this.#popups.filter(id => id !== uid);
    this.listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  openDialog(dialog: DialogData): void {
  }
  openMenu(menu: MenuData): void {
  }
  closePopup(): void {
  }

  get lockUid() {
    return this.#popups[this.#popups.length - 1];
  }
}
