import { List } from "abstract-list";
import { IUpdatableList, IUpdateNotifier, UpdateNotifier } from "list-accumulator";

export class ItemsGroup<T> extends UpdateNotifier implements IUpdatableList<T> {
  constructor(protected elems: (List<T> & Partial<IUpdateNotifier>) | (T[] & { informUpdate: undefined })) {
    super();
  }

  informUpdate(id: number, type?: number | undefined): void {
    super.informUpdate(id, type);
    this.elems.informUpdate?.(id, type);
  }

  get length(): List<T>["length"] {
    return this.elems.length;
  }

  at(index: number): T | undefined {
    return this.elems.at(index);
  }
}
