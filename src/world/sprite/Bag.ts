import { List } from "abstract-list";

export interface Bag<T> {
  elems: List<T>;
  done(): void;
}
