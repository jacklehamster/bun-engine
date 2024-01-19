import { Auxiliary } from "world/aux/Auxiliary";
import { List } from "./List";
import { UpdatableList } from "./UpdatableList";

export interface IAccumulator<T> extends List<T>, Auxiliary {
  add(...elemsList: (UpdatableList<T> | T[] & { informUpdate: undefined })[]): void;
}
