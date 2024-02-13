import { Auxiliary } from "world/aux/Auxiliary";
import { List, forEach } from "abstract-list";
import { UpdatableList } from "../../../core/UpdatableList";
import { UpdateNotifier } from "updates/UpdateNotifier";

export class ItemsGroup<T> extends UpdateNotifier implements UpdatableList<T>, Auxiliary {
  #active = false;

  constructor(protected elems: (UpdatableList<T> | T[] & { informUpdate: undefined })) {
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
    if (!this.#active) {
      return undefined;
    }
    return this.elems.at(index);
  }

  activate(): void {
    if (!this.#active) {
      this.#active = true;
      forEach(this.elems, (_, index) => this.informUpdate(index));
    }
  }

  deactivate(): void {
    if (this.#active) {
      this.#active = false;
      forEach(this.elems, (_, index) => this.informUpdate(index));
    }
  }
}
