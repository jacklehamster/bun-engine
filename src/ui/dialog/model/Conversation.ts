import { List } from "abstract-list";
import { Message } from "./Message";

export interface Conversation {
  messages: List<Message> | Message[];
}
