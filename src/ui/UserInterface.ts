import { Auxiliary } from "world/aux/Auxiliary";
import { Listener } from "./Listener";
import { MenuData } from "./menu/model/MenuData";
import { DialogData } from "./dialog/model/DialogData";

export interface UserInterface extends Auxiliary {
  addDialogListener(listener: Listener): void;
  removeDialogListener(listener: Listener): void;
  showMenu(menu: MenuData): void;
  showDialog(dialog: DialogData): void;
  dismissMenu(): void;
}
