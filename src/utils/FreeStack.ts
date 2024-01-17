import { List } from "world/sprite/List";

export interface FreeStack<T> {
  getList(): List<T>;
  contains(value: T): boolean;
  remove(value: T): boolean;
  pushTop(value: T): void;
  moveTop(value: T): boolean;
  popBottom(): T | undefined;
  get size(): number;
}
