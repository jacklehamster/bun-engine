import { PopAction } from "../../actions/PopAction";

export interface Message {
  id?: string;
  text?: string;
  action?: PopAction | (PopAction | undefined)[];
}
