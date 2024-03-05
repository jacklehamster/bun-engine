import { PopupData } from "ui/model/ui/PopupData";
import { Conversation } from "../conversation/Conversation";

export interface DialogData extends PopupData {
  type?: "dialog",
  conversation: Conversation;
  onClose?: () => void;
}
