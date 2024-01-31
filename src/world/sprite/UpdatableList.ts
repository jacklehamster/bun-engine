import { UpdateNotifier } from "updates/UpdateNotifier";
import { List } from "abstract-list";

export type UpdatableList<T> = List<T> & Partial<UpdateNotifier>;
