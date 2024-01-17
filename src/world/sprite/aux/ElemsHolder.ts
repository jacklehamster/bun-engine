import { ListNotifier } from "./ListNotifier";

export interface ElemsHolder<T> {
  add(...elems: ListNotifier<T>[]): void;
  addNewElemsListener(listener: (holder: ElemsHolder<T>) => void): void;
}
