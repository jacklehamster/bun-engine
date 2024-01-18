import { Holder } from "world/aux/Holder";
import { ListNotifier } from "./ListNotifier";

export interface ElemsHolder<T> extends Holder {
  add(...elems: ListNotifier<T>[]): void;
  addNewElemsListener(listener: (holder: ElemsHolder<T>) => void): void;
}
