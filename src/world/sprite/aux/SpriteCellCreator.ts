import { Cell, Tag } from "world/grid/Cell";
import { ICellCreator } from "./ICellCreator";
import { IElemFactory } from "./IElemFactory";
import { Sprite } from "../Sprite";
import { ObjectPool } from "bun-pool";
import { copySprite } from "../utils/sprite-utils";
import { forEach } from "core/List";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { Active } from "core/Active";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";

interface Props {
  factory: IElemFactory<Sprite>
  slotPool?: ObjectPool<Slot<Sprite>, [Sprite, Tag]>
}

interface Slot<T> {
  elem: T;
  tag: Tag;
}

export class SpriteCellCreator extends AuxiliaryHolder implements ICellCreator<Sprite>, Active {
  private readonly factory: IElemFactory<Sprite>;
  private readonly slots: Slot<Sprite>[] = [];
  private readonly slotPool;

  constructor({ factory, slotPool }: Props) {
    super();
    this.factory = factory;
    this.slotPool = slotPool ?? new SlotPool(copySprite);
  }

  get length(): number {
    return this.slots.length;
  }

  at(index: number): Sprite | undefined {
    return this.slots[index]?.elem;
  }

  deactivate(): void {
    this.slots.forEach(slot => this.slotPool.recycle(slot));
    this.slots.length = 0;
    super.deactivate();
  }

  informUpdate(_id: number, _type?: number | undefined): void {
    //  needs overwrite
  }

  createCell(cell: Cell): boolean {
    let count = 0;
    const { tag } = cell;
    const elems = this.factory.getElemsAtCell(cell);
    forEach(elems, elem => {
      if (elem) {
        const slot = this.slotPool.create(elem, tag);
        const spriteId = this.slots.length;
        this.slots.push(slot);
        this.informUpdate(spriteId);
        count++;
      }
    });
    this.factory.doneCellTracking?.(cell);
    return !!count;
  }

  destroyCells(tags: Set<Tag>): void {
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (tags.has(slot.tag)) {
        this.informUpdate(i);
        this.informUpdate(this.slots.length - 1, SpriteUpdateType.TRANSFORM);
        this.slots[i] = this.slots[this.slots.length - 1];
        this.slots.pop();
        this.slotPool.recycle(slot);
      }
    }
  }
}


class SlotPool<T> extends ObjectPool<Slot<T>, [T, string]> {
  constructor(copy: (elem: T, dest?: T) => T) {
    super((slot, elem: T, tag: string) => {
      if (!slot) {
        return { elem: copy(elem), tag };
      }
      slot.elem = copy(elem, slot.elem);
      slot.tag = tag;
      return slot;
    });
  }
}