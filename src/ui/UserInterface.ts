import { Auxiliary } from "world/aux/Auxiliary";
import { MenuData } from "./menu/model/MenuData";
import { DialogData } from "./dialog/model/DialogData";

export interface UserInterface extends Auxiliary {
  openMenu(menu: MenuData): Promise<void>;
  openDialog(dialog: DialogData): Promise<void>;
  closePopup(): void;
  nextMessage(): void;
  get selection(): number
}
