import { List } from "world/sprite/List";
import { Message } from "./Message";

export interface Conversation {
  messages: List<Message>;
}
