import { Listener } from '../Listener';
import { DialogData } from '../dialog/model/DialogData';
import { MenuData } from '../menu/model/MenuData';

export class PopupManager {
  #popups: string[] = [];

  constructor(private listeners: Set<Listener>) {
    this.addPopup = this.addPopup.bind(this);
    this.removePopup = this.removePopup.bind(this);
  }

  addPopup(uid: string): void {
    this.#popups.push(uid);
    this.listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  removePopup(uid: string): void {
    this.#popups = this.#popups.filter(id => id !== uid);
    this.listeners.forEach(listener => listener.onPopup(this.#popups.length));
  }

  popDialog?(dialog: DialogData): void;
  popMenu?(menu: MenuData): void;

  get lockUid() {
    return this.#popups[this.#popups.length - 1];
  }
}
