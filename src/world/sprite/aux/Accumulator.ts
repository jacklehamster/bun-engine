import { IdType } from "dok-types";
import { UpdatableList } from "../../../core/UpdatableList";
import { ObjectPool } from "bun-pool";
import { IUpdateListener, IUpdateNotifier } from "updates/IUpdateNotifier";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { List, forEach } from "abstract-list";

interface Slot<T> {
  elems: List<T>;
  index: IdType;
}

interface Props<T> {
  updateNotifier?: IUpdateNotifier;
  onChange?(value: number): void;
}

export class Accumulator<T> implements List<T>, IUpdateNotifier {
  readonly #indices: (Slot<T> | undefined)[] = [];
  readonly #pool = new SlotPool<T>();
  readonly #updateNotifier: IUpdateNotifier;
  readonly #freeIndices: number[] = [];
  readonly length: List<T>["length"] & {};
  readonly #updateListenerMap: Map<List<T>, IUpdateListener> = new Map();

  constructor({
    updateNotifier = new UpdateNotifier(),
    onChange,
  }: Partial<Props<T>> = {}) {
    this.#updateNotifier = updateNotifier;
    this.length = {
      valueOf: () => this.#indices.length,
      onChange: onChange ? (value) => onChange?.(value) : undefined,
    }
  }

  at(id: IdType): T | undefined {
    const slot = this.#indices[id];
    return slot?.elems.at(slot.index);
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

  add(elems: List<T> & Partial<IUpdateNotifier>): void {
    const indexMapping: (number | undefined)[] = [];
    const updateListener: IUpdateListener = {
      onUpdate: (index, type) => {
        const elem = this.#updateListenerMap.has(elems) ? elems.at(index) : undefined;
        let id = indexMapping[index];
        if (id === undefined) {
          if (!elem) {
            //  no update needed on non-existing item
            return;
          }
          //  create new entry
          const freeId = this.#freeIndices.pop();
          id = freeId ?? this.#indices.length;
          indexMapping[index] = id;
          this.informUpdate(id);
          this.#indices[id] = this.#pool.create(elems, index, id);
          if (freeId === undefined) {
            this.#onSizeChange();
          }
          return;
        } else if (!elem) {
          //  remove entry
          indexMapping[index] = undefined;
          this.informUpdate(id);
          const slot = this.#indices[id];
          if (slot) {
            this.#pool.recycle(slot);
            this.#indices[id] = undefined;
          }
          this.#freeIndices.push(id);
          return;
        }

        //  Inform update
        this.informUpdate(id, type);
      },
    };
    this.#updateListenerMap.set(elems, updateListener);
    elems.addUpdateListener?.(updateListener);
    forEach(elems, (_, index) => updateListener.onUpdate(index));
  }

  remove(elems: List<T> & Partial<IUpdateNotifier>): void {
    const listener = this.#updateListenerMap.get(elems);
    if (listener) {
      this.#updateListenerMap.delete(elems);
      forEach(elems, (_, index) => listener.onUpdate(index));
      elems.removeUpdateListener?.(listener);
    }
  }

  #onSizeChange() {
    this.length.onChange?.(this.length.valueOf());
  }

  clear(): void {
    this.#indices.forEach((slot, id) => {
      this.informUpdate(id);
      if (slot) {
        this.#pool.recycle(slot);
      }
    });
    this.#freeIndices.length = 0;
    this.#indices.length = 0;
    this.#onSizeChange();
  }
}

class SlotPool<T> extends ObjectPool<Slot<T>, [List<T>, IdType, IdType]> {
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
