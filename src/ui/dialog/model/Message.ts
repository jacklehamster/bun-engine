import { DialogInterface } from "../DialogInterface";

export interface Message {
  text?: string;
  next?: boolean;
  action?(ui: DialogInterface): void;
}
