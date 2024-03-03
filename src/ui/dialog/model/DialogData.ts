import { PopupData } from "ui/popup/model/PopupData";
import { Conversation } from "./Conversation";

export interface DialogData extends PopupData {
  type?: "dialog",
  conversation: Conversation;
  onClose?: () => void;
}
