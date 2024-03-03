import { Auxiliary } from "world/aux/Auxiliary";
import { MenuData } from "./menu/model/MenuData";
import { DialogData } from "./dialog/model/DialogData";

export interface UserInterface extends Auxiliary {
  openMenu(menu: MenuData): void;
  openDialog(dialog: DialogData): void;
  closePopup(): void;
}
