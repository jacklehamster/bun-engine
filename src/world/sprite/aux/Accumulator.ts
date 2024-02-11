import { IdType } from "dok-types";
import { ElemsHolder, NewElemListener } from "./ElemsHolder";
import { UpdatableList } from "../UpdatableList";
import { ObjectPool } from "bun-pool";
import { Auxiliary } from "world/aux/Auxiliary";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { IUpdateListener, IUpdateNotifier } from "updates/IUpdateNotifier";
import { UpdateNotifier } from "updates/UpdateNotifier";

interface Slot<T> {
  elems: UpdatableList<T>;
  index: IdType;
}

interface Props<T> {
  updateNotifier?: IUpdateNotifier;
  newElemListeners?: NewElemListener<T>[];
}

export class Accumulator<T> extends AuxiliaryHolder implements ElemsHolder<T>, IUpdateNotifier {
  readonly #indices: Slot<T>[] = [];
  readonly #pool = new SlotPool<T>();
  readonly #updateNotifier: IUpdateNotifier;
  readonly #newElemListeners;

  constructor({
    updateNotifier = new UpdateNotifier(),
    newElemListeners = [],
  }: Partial<Props<T>> = {}) {
    super();
    this.#updateNotifier = updateNotifier;
    this.#newElemListeners = new Set(newElemListeners);
  }

  at(id: IdType): T | undefined {
    const slot = this.#indices[id];
    return slot?.elems.at(slot.index);
  }

  get length(): number {
    return this.#indices.length;
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

  addNewElemsListener(listener: NewElemListener<T>): void {
    this.#newElemListeners.add(listener);
  }

  removeNewElemsListener(listener: NewElemListener<T>): void {
    this.#newElemListeners.delete(listener);
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
          id = this.#indices.length;
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
            this.#pool.recycle(slot);

            const lastSlotId = this.#indices.length - 1;
            if (id !== lastSlotId) {
              this.#indices[id] = this.#indices[lastSlotId];
              this.informUpdate(lastSlotId);
            }
            this.#indices.pop();
            this.informUpdate(id);
            this.#onSizeChange();
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
    this.#newElemListeners.forEach(listener => listener.onNewElem(this));
  }

  #informFullUpdate() {
    this.#indices.forEach((_slot, id) => this.informUpdate(id));
  }

  #clear(): void {
    this.#indices.forEach(slot => this.#pool.recycle(slot));
    this.#indices.length = 0;
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
