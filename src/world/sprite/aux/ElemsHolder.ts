import { Holder } from "world/aux/Holder";
import { UpdatableList } from "../UpdatableList";
import { List } from "../../../core/List";

export interface ElemsHolder<T> extends Holder, List<T> {
  add(...elems: UpdatableList<T>[]): void;
  addNewElemsListener(listener: (holder: ElemsHolder<T>) => void): void;
}
