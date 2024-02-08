import { List } from "abstract-list";

export interface NewElemListener<T> {
  onNewElem(accumulator: ElemsHolder<T>): void;
}

export interface ElemsHolder<T> extends List<T> {
  addNewElemsListener(listener: NewElemListener<T>): void;
  removeNewElemsListener(listener: NewElemListener<T>): void;
}
