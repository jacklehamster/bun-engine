import { List } from "../List";
import { UpdateNotifier } from "updates/UpdateNotifier";


export type ListNotifier<T> = List<T> & Partial<UpdateNotifier>;
