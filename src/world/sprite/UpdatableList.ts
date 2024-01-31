import { UpdateNotifier } from "updates/UpdateNotifier";
import { List } from "../../core/List";

export type UpdatableList<T> = List<T> & Partial<UpdateNotifier>;
