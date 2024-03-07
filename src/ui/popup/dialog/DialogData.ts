import { PopupData } from "ui/popup/base/PopupData";
import { Conversation } from "./Conversation";

export interface DialogData extends PopupData {
  type?: "dialog",
  conversation: Conversation;
  onClose?: () => void;
}
