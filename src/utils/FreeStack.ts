import { List } from "world/sprite/List";

export interface FreeStack<T> {
  getList(): List<T>;
  remove(value: T): boolean;
  pushTop(value: T): void;
  popBottom(): T | undefined;
  get size(): number;
}
