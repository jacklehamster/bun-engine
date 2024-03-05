import { MenuData } from "./model/ui/MenuData";
import { DialogData } from "./model/ui/DialogData";

export interface UserInterface {
  openMenu(menu: MenuData): Promise<void>;
  openDialog(dialog: DialogData): Promise<void>;
  closePopup(uid?: string): void;
  nextMessage(): void;
  get selection(): number
}
