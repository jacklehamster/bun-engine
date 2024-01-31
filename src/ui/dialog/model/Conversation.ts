import { List } from "core/List";
import { Message } from "./Message";

export interface Conversation {
  messages: List<Message>;
}
