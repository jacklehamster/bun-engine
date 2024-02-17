import { IUpdateNotifier } from "updates/IUpdateNotifier";
import { List } from "abstract-list";

export type UpdatableList<T> = List<T> & IUpdateNotifier;
