import { Auxiliary } from "world/aux/Auxiliary";
import { forEach } from "abstract-list";
import { UpdatableList } from "../UpdatableList";
import { UpdateNotifier } from "updates/UpdateNotifier";

export class ItemsGroup<T> extends UpdateNotifier implements UpdatableList<T>, Auxiliary {
  private _active = false;

  constructor(protected elems: (UpdatableList<T> | T[] & { informUpdate: undefined })) {
    super();
  }

  informUpdate(id: number, type?: number | undefined): void {
    super.informUpdate(id, type);
    this.elems.informUpdate?.(id, type);
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
