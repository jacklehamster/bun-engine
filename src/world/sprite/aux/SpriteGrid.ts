import { Sprite, copySprite } from "../Sprite";
import { Cell } from "world/grid/CellPos";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { forEach } from "../List";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { ISpriteFactory } from "./ISpriteFactory";
import { ObjectPool } from "utils/ObjectPool";
import { SpritesHolder } from "./SpritesHolder";
import { UpdatePayload } from "updates/Refresh";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";

interface Config {
  xRange?: [number, number],
  yRange?: [number, number],
  zRange?: [number, number],
}

interface Slot {
  sprite: Sprite;
  tag: string;
}

export class SpriteGrid extends AuxiliaryHolder<SpritesHolder> implements UpdateNotifier {
  private slots: Slot[] = [];
  private ranges: [[number, number], [number, number], [number, number]];
  private slotPool: ObjectPool<Slot, [Sprite, string]> = new ObjectPool<Slot, [Sprite, string]>((slot, sprite: Sprite, tag: string) => {
    if (!slot) {
      return { sprite: copySprite(sprite), tag };
    }
    slot.sprite = copySprite(sprite, slot.sprite);
    slot.tag = tag;
    return slot;
  });
  holder?: SpritesHolder;

  constructor(config?: Config, private spriteFactory: ISpriteFactory = {}) {
    super();
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

  at(index: number): Sprite | undefined {
    return this.slots[index]?.sprite;
  }

  trackCell(cell: Cell, updatePayload: UpdatePayload): boolean {
    const [[minX, maxX], [minY, maxY], [minZ, maxZ]] = this.ranges;
    const [x, y, z] = cell.pos;
    if (x < minX || maxX < x || y < minY || maxY < y || z < minZ || maxZ < z) {
      return false;
    }
    let spriteCount = 0;
    const { tag } = cell;
    const sprites = this.spriteFactory.getSpritesAtCell?.(cell, updatePayload);
    forEach(sprites, sprite => {
      if (sprite) {
        const spriteId = this.slots.length;
        const slot = this.slotPool.create(sprite, tag);
        this.slots.push(slot);
        this.informUpdate(spriteId);
        spriteCount++;
      }
    });
    this.spriteFactory.doneCellTracking?.(cell, updatePayload);
    return !!spriteCount;
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
