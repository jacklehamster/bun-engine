import { UpdateNotifier } from "updates/UpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { forEach } from "../../../core/List";
import { UpdatableList } from "../UpdatableList";

export class ItemsGroup<T> implements UpdatableList<T>, Auxiliary {
  private _active = false;

  constructor(protected elems: UpdatableList<T> | (T[] & Partial<UpdateNotifier>)) {
  }

  get length(): number {
    return this.elems.length;
  }

  at(index: number): T | undefined {
    if (!this._active) {
      return undefined;
    }
    return this.elems.at(index);
  }

  informUpdate(id: number): void {
    this.elems.informUpdate?.(id);
  }

  activate(): void {
    if (!this._active) {
      this._active = true;
      forEach(this.elems, (_, index) => this.informUpdate(index));
    }
  }

  deactivate(): void {
    if (this._active) {
      this._active = false;
      forEach(this.elems, (_, index) => this.informUpdate(index));
    }
  }
}
