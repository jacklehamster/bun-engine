import { PopupInterface } from "ui/popup/PopupInterface";

export interface DialogInterface extends PopupInterface {
  nextMessage(): void;
}
