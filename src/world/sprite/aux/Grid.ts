import { Cell, Tag } from "world/grid/Cell";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { forEach } from "../List";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ElemsHolder } from "./ElemsHolder";
import { IElemFactory } from "./IElemFactory";
import { ObjectPool } from "utils/ObjectPool";

interface Boundaries {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

export interface Config {
  xRange?: [number, number];
  yRange?: [number, number];
  zRange?: [number, number];
}

interface Slot<T> {
  elem: T;
  tag: Tag;
}

export class Grid<T> extends AuxiliaryHolder<ElemsHolder<T>> implements UpdateNotifier {
  private readonly slots: Slot<T>[] = [];
  private readonly boundaries: Boundaries;
  private readonly factories: IElemFactory<T>[];
  private readonly slotPool;
  holder?: ElemsHolder<T>;

  constructor(copy: (elem: T, previousElem?: T) => T, config?: Config, ...factories: IElemFactory<T>[]) {
    super();
    this.factories = factories;
    this.slotPool = new SlotPool(copy);
    this.boundaries = {
      minX: config?.xRange?.[0] ?? Number.NEGATIVE_INFINITY,
      maxX: config?.xRange?.[1] ?? Number.POSITIVE_INFINITY,
      minY: config?.yRange?.[0] ?? Number.NEGATIVE_INFINITY,
      maxY: config?.yRange?.[1] ?? Number.POSITIVE_INFINITY,
      minZ: config?.zRange?.[0] ?? Number.NEGATIVE_INFINITY,
      maxZ: config?.zRange?.[1] ?? Number.POSITIVE_INFINITY,
    };
  }

  informUpdate(_id: number, _type?: number | undefined): void {
    //  needs overwrite
  }

  activate(): void {
    super.activate();
    this.holder?.add(this);
  }

  deactivate(): void {
    this.slots.forEach(slot => this.slotPool.recycle(slot));
    this.slots.length = 0;
    super.deactivate();
  }

  get length(): number {
    return this.slots.length;
  }

  at(index: number): T | undefined {
    return this.slots[index]?.elem;
  }

  trackCell(cell: Cell): boolean {
    const { minX, maxX, minY, maxY, minZ, maxZ } = this.boundaries;
    const x = cell.pos[0];
    const y = cell.pos[1];
    const z = cell.pos[2];
    if (x < minX || maxX < x || y < minY || maxY < y || z < minZ || maxZ < z) {
      return false;
    }
    let count = 0;
    const { tag } = cell;
    for (let factory of this.factories) {
      const elems = factory.getElemsAtCell(cell);
      forEach(elems, elem => {
        if (elem) {
          const slot = this.slotPool.create(elem, tag);
          const spriteId = this.slots.length;
          this.slots.push(slot);
          this.informUpdate(spriteId);
          count++;
        }
      });
      factory.doneCellTracking?.(cell);
    }
    return !!count;
  }

  untrackCell(cellTag: string): void {
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (slot.tag === cellTag) {
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
