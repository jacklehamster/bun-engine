import { MenuData } from "./menu/MenuData";
import { DialogData } from "./dialog/DialogData";

export interface UserInterface {
  openMenu(menu: MenuData): Promise<void>;
  openDialog(dialog: DialogData): Promise<void>;
  closePopup(uid?: string): void;
  nextMessage(): void;
  get selection(): number
}
