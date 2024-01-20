import { UpdateNotifier } from "updates/UpdateNotifier";
import { List } from "./List";

export type UpdatableList<T> = (List<T> | T[]) & Partial<UpdateNotifier>;
