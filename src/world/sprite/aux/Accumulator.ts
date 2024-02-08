import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { IdType } from "core/IdType";
import { ElemsHolder, NewElemListener } from "./ElemsHolder";
import { UpdatableList } from "../UpdatableList";
import { ObjectPool } from "bun-pool";
import { Auxiliary } from "world/aux/Auxiliary";
import { List } from "abstract-list";

interface Slot<T> {
  elems: UpdatableList<T>;
  index: IdType;
}

export class Accumulator<T> extends AuxiliaryHolder implements ElemsHolder<T> {
  private readonly indices: Slot<T>[] = [];
  private readonly newElemsListener: Set<NewElemListener<T>> = new Set();
  private readonly pool = new SlotPool<T>();

  informUpdate?(id: number, type?: number): void;

  at(id: IdType): T | undefined {
    const slot = this.indices[id];
    return slot?.elems.at(slot.index);
  }

  get length(): number {
    return this.indices.length;
  }

  activate(): void {
    super.activate();
    this.informFullUpdate();
  }

  deactivate(): void {
    this.informFullUpdate();
    this.clear();
    super.deactivate();
  }

  private informFullUpdate() {
    this.indices.forEach((_slot, id) => this.informUpdate?.(id));
  }

  private clear(): void {
    this.indices.forEach(slot => this.pool.recycle(slot));
    this.indices.length = 0;
  }

  addAuxiliary(aux: Auxiliary): this {
    super.addAuxiliary(aux);
    if ((aux as Partial<List<any>>).at) {
      this.add(aux as List<any>);
    }
    return this;
  }

  private add(elems: UpdatableList<T> | T[] & { informUpdate: undefined, activate: undefined }): this {
    const indexMaping: (number | undefined)[] = [];
    if (elems.informUpdate) {
      //  overwrite if it's defined to informUpdate through SpriteAccumulator.
      elems.informUpdate = (index, type) => {
        const elem = elems.at(index);
        let id = indexMaping[index];
        if (id === undefined) {
          if (!elem) {
            //  no update needed on non-existing item
            return;
          }
          //  create new entry
          id = this.indices.length;
          indexMaping[index] = id;
          this.informUpdate?.(id);
          this.indices.push(this.pool.create(elems, index, id));
          this.onSizeChange();
          return;
        } else {
          if (!elem) {
            //  remove entry
            indexMaping[index] = undefined;
            const slot = this.indices[id];
            this.pool.recycle(slot);

            const lastSlotId = this.indices.length - 1;
            if (id !== lastSlotId) {
              this.indices[id] = this.indices[lastSlotId];
              this.informUpdate?.(lastSlotId);
            }
            this.indices.pop();
            this.informUpdate?.(id);
            this.onSizeChange();
            return;
          }
        }

        //  Inform update
        this.informUpdate?.(id, type);
      };
    } else {
      throw new Error("informUpdate must be defined");
    }
    return this;
  }

  onSizeChange() {
    this.newElemsListener.forEach(listener => listener.onNewElem(this));
  }

  addNewElemsListener(listener: NewElemListener<T>): void {
    this.newElemsListener.add(listener);
  }

  removeNewElemsListener(listener: NewElemListener<T>): void {
    this.newElemsListener.delete(listener);
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
