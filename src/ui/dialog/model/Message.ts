import { PopupInterface } from "ui/popup/PopupInterface";

export interface Message {
  id?: string;
  text?: string;
  action?(ui: PopupInterface): void;
}
