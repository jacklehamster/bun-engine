import { Auxiliary } from "world/aux/Auxiliary";
import { List } from "./List";
import { ListNotifier } from "./aux/ListNotifier";

export interface IAccumulator<T> extends List<T>, Auxiliary {
  add(...elemsList: (ListNotifier<T> | T[] & { informUpdate: undefined })[]): void;
}
