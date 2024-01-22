import { Listener } from './Listener';
import { DialogData } from './dialog/model/DialogData';
import { MenuData } from './menu/model/MenuData';

export class PopupManager {
  private popups: Set<string> = new Set();

  constructor(private listeners: Set<Listener>) {
    this.showPopup = this.showPopup.bind(this);
    this.dismiss = this.dismiss.bind(this);
  }

  showPopup(uid: string): void {
    this.popups.add(uid);
    this.listeners.forEach(listener => listener.onPopup(this.popups.size));
  }

  dismiss(uid: string): void {
    this.popups.delete(uid);
    this.listeners.forEach(listener => listener.onPopup(this.popups.size));
  }

  showDialog?(dialog: DialogData): void;
  dismissDialog?(): void;

  showMenu?(menu: MenuData): void;
  dismissMenu?(): void;
}
