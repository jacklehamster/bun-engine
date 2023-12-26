import { IdType } from "core/Active";
import { List } from "world/sprite/List";
import { UpdateNotifier } from "./UpdateNotifier";

export class UpdatableList<T> implements List<T> {
  constructor(
    private readonly array: List<T>,
    private updateValue: (index: IdType, value: T) => void,
    private readonly notifier?: UpdateNotifier) {
  }

  at(index: number) {
    return this.array.at(index);
  }

  get length() {
    return this.array.length;
  }

  set(index: IdType, value: T) {
    this.updateValue(index, value);
    this.notifier?.informUpdate(index);
  }
}
