import { Holder } from "world/aux/Holder";
import { UpdatableList } from "../UpdatableList";

export interface ElemsHolder<T> extends Holder {
  add(...elems: UpdatableList<T>[]): void;
  addNewElemsListener(listener: (holder: ElemsHolder<T>) => void): void;
}
