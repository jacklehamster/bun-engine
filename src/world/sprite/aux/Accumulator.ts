import { IdType, Val } from "dok-types";
import { UpdatableList } from "../../../core/UpdatableList";
import { ObjectPool } from "bun-pool";
import { Auxiliary } from "world/aux/Auxiliary";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { IUpdateListener, IUpdateNotifier } from "updates/IUpdateNotifier";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { List } from "abstract-list";

interface Slot<T> {
  elems: UpdatableList<T>;
  index: IdType;
}

interface Props<T> {
  updateNotifier?: IUpdateNotifier;
  onChange?(value: number): void;
}

export class Accumulator<T> extends AuxiliaryHolder implements List<T>, IUpdateNotifier {
  readonly #indices: (Slot<T> | undefined)[] = [];
  readonly #pool = new SlotPool<T>();
  readonly #updateNotifier: IUpdateNotifier;
  readonly #freeIndices: number[] = [];
  readonly length: List<T>["length"];

  constructor({
    updateNotifier = new UpdateNotifier(),
    onChange,
  }: Partial<Props<T>> = {}) {
    super();
    this.#updateNotifier = updateNotifier;
    this.length = {
      valueOf: () => this.#indices.length,
      onChange: (value) => onChange?.(value),
    }
  }

  at(id: IdType): T | undefined {
    const slot = this.#indices[id];
    return slot?.elems.at(slot.index);
  }

  activate(): void {
    super.activate();
    this.#informFullUpdate();
  }

  deactivate(): void {
    this.#informFullUpdate();
    this.#clear();
    super.deactivate();
  }

  addAuxiliary(aux: Auxiliary): this {
    super.addAuxiliary(aux);
    if ((aux as Partial<UpdatableList<T>>).at) {
      this.#add(aux as UpdatableList<T>);
    }
    return this;
  }

  informUpdate(id: number, type?: number | undefined): void {
    this.#updateNotifier.informUpdate(id, type);
  }

  addUpdateListener(listener: IUpdateListener): void {
    this.#updateNotifier.addUpdateListener(listener);
  }

  removeUpdateListener(listener: IUpdateListener): void {
    this.#updateNotifier.removeUpdateListener(listener);
  }

  #add(elems: UpdatableList<T>): this {
    const indexMaping: (number | undefined)[] = [];
    elems.addUpdateListener?.({
      onUpdate: (index, type) => {
        const elem = elems.at(index);
        let id = indexMaping[index];
        if (id === undefined) {
          if (!elem) {
            //  no update needed on non-existing item
            return;
          }
          //  create new entry
          id = this.#freeIndices.pop() ?? this.#indices.length;
          indexMaping[index] = id;
          this.informUpdate(id);
          this.#indices.push(this.#pool.create(elems, index, id));
          this.#onSizeChange();
          return;
        } else {
          if (!elem) {
            //  remove entry
            indexMaping[index] = undefined;
            const slot = this.#indices[id];
            if (slot) {
              this.#pool.recycle(slot);
              this.#indices[id] = undefined;
            }
            if (id === this.#indices.length - 1) {
              this.#indices.length--;
            } else {
              this.#freeIndices.push(id);
            }
            return;
          }
        }

        //  Inform update
        this.informUpdate(id, type);
      },
    });
    return this;
  }

  #onSizeChange() {
    this.length.onChange!(this.length.valueOf());
  }

  #informFullUpdate() {
    this.#indices.forEach((_slot, id) => this.informUpdate(id));
  }

  #clear(): void {
    this.#indices.forEach(slot => {
      if (slot) {
        this.#pool.recycle(slot);
      }
    });
    this.#freeIndices.length = 0;
    this.#indices.length = 0;
    this.#onSizeChange();
  }
}

class SlotPool<T> extends ObjectPool<Slot<T>, [UpdatableList<T>, IdType, IdType]> {
  constructor() {
    super((slot, elems, index) => {
      if (!slot) {
        return { elems, index };
      }
      slot.elems = elems;
      slot.index = index;
      return slot;
    });
  }
}
