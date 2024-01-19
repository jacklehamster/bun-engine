import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ObjectPool } from "utils/ObjectPool";
import { forEach } from "../List";
import { IdType } from "core/IdType";
import { ElemsHolder } from "./ElemsHolder";
import { IAccumulator } from "../IAccumulator";
import { UpdatableList } from "../UpdatableList";

interface Slot<T> {
  elems: UpdatableList<T>;
  index: IdType;
  id?: IdType;
}

export class Accumulator<T> extends AuxiliaryHolder implements ElemsHolder<T>, IAccumulator<T> {
  private readonly indices: Slot<T>[] = [];
  private readonly newElemsListener: Set<(accumulator: ElemsHolder<T>) => void> = new Set();
  private readonly pool: ObjectPool<Slot<T>, [UpdatableList<T>, IdType]> = new ObjectPool<Slot<T>, [UpdatableList<T>, number]>((slot, elems, index) => {
    if (!slot) {
      return { elems, index };
    }
    slot.elems = elems;
    slot.index = index;
    slot.id = undefined;
    return slot;
  });

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
    this.indices.forEach(slot => {
      if (slot.id !== undefined) {
        this.informUpdate?.(slot.id);
      }
    });
  }

  private clear(): void {
    this.indices.forEach(slot => this.pool.recycle(slot));
    this.indices.length = 0;
  }

  add(...elemsList: (UpdatableList<T> | T[] & { informUpdate: undefined, activate: undefined })[]): void {
    elemsList.forEach(elems => {
      const slots: Slot<T>[] = [];
      if (elems.informUpdate) {
        //  overwrite if it's defined to informUpdate through SpriteAccumulator.
        elems.informUpdate = (index, type) => {
          const slot = slots[index] ?? (slots[index] = this.pool.create(elems, index));
          const elem = slot.elems.at(index);
          if (elem) {
            if (slot.id === undefined) {
              slot.id = this.indices.length;
              this.indices.push(slot);
              this.onSizeChange();
            }
            this.informUpdate?.(slot.id, type);
          } else {
            if (slot.id !== undefined) {
              const id = slot.id;
              slot.id = undefined;
              if (this.indices.length) {
                const lastSlotId = this.indices.length - 1;
                if (id !== lastSlotId) {
                  this.indices[id] = this.indices[lastSlotId];
                  this.indices[id].id = id;
                }
                this.indices.pop();
                this.informUpdate?.(lastSlotId);
                this.onSizeChange();
              }
              this.informUpdate?.(id);
            }
          }
        };
      } else {
        forEach(elems, (_, index) => {
          const slot = this.pool.create(elems, index);
          slot.id = this.indices.length;
          this.indices.push(slot);
        });
      }
    });
  }

  onSizeChange() {
    this.newElemsListener.forEach(listener => listener(this));
  }

  addNewElemsListener(listener: (holder: ElemsHolder<T>) => void): void {
    this.newElemsListener.add(listener);
  }
}
