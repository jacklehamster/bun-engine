import { Cell } from "world/grid/CellPos";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { forEach } from "../List";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ElemsHolder } from "./ElemsHolder";
import { IElemFactory } from "./IElemFactory";
import { ObjectPool } from "utils/ObjectPool";

export interface Config {
  xRange?: [number, number];
  yRange?: [number, number];
  zRange?: [number, number];
}

interface Slot<T> {
  elem: T;
  tag: string;
}

export class Grid<T> extends AuxiliaryHolder<ElemsHolder<T>> implements UpdateNotifier {
  private readonly slots: Slot<T>[] = [];
  private readonly ranges: [[number, number], [number, number], [number, number]];
  private readonly factories: IElemFactory<T>[];
  private readonly slotPool;
  holder?: ElemsHolder<T>;

  constructor(copy: (elem: T, previousElem?: T) => T, config?: Config, ...factories: IElemFactory<T>[]) {
    super();
    this.factories = factories;
    this.slotPool = new SlotPool(copy);
    this.ranges = [
      config?.xRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
      config?.yRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
      config?.zRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
    ];
  }

  informUpdate(_id: number, _type?: number | undefined): void {
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
    const [[minX, maxX], [minY, maxY], [minZ, maxZ]] = this.ranges;
    const [x, y, z] = cell.pos;
    if (x < minX || maxX < x || y < minY || maxY < y || z < minZ || maxZ < z) {
      return false;
    }
    let count = 0;
    const { tag } = cell;
    this.factories.forEach(factory => {
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
    });
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
