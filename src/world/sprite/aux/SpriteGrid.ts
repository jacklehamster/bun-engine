import { Sprite, copySprite } from "../Sprite";
import { Cell } from "world/grid/CellPos";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { Auxiliary } from "world/aux/Auxiliary";
import { forEach } from "../List";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { SpriteFactory } from "./SpriteFactory";
import IWorld from "world/IWorld";

interface Config {
  spriteLimit?: number;
  xRange?: [number, number],
  yRange?: [number, number],
  zRange?: [number, number],
}

interface Slot {
  sprite: Sprite;
  tag: string;
}

export class SpriteGrid implements Auxiliary<IWorld>, UpdateNotifier {
  private slots: Slot[] = [];
  private spriteLimit: number;
  private ranges: [[number, number], [number, number], [number, number]];
  holder?: IWorld;

  informUpdate(_id: number, _type?: number | undefined): void {
  }

  activate(): void {
    this.holder?.addSprites(this);
  }

  constructor(config?: Config, private spriteFactory: SpriteFactory = {}) {
    this.spriteLimit = config?.spriteLimit ?? 100;
    this.ranges = [
      config?.xRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
      config?.yRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
      config?.zRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
    ];
  }

  get length(): number {
    return this.spriteLimit;
  }

  at(index: number): Sprite | undefined {
    return this.slots[index]?.sprite;
  }

  trackCell(cell: Cell): void {
    const [[minX, maxX], [minY, maxY], [minZ, maxZ]] = this.ranges;
    const [x, y, z] = cell.pos;
    if (x < minX || maxX < x || y < minY || maxY < y || z < minZ || maxZ < z) {
      return;
    }
    const { tag } = cell;
    forEach(this.spriteFactory.getSpritesAtCell?.(cell), sprite => {
      if (sprite) {
        this.informUpdate(this.slots.length);
        this.slots.push({
          sprite: copySprite(sprite), tag,
        });
      }
    });
  }

  untrackCell(cellTag: string): void {
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (slot.tag === cellTag) {
        this.informUpdate(i, SpriteUpdateType.ALL);
        this.informUpdate(this.slots.length - 1, SpriteUpdateType.TRANSFORM);
        this.slots[i] = this.slots[this.slots.length - 1];
        this.slots.pop();
      }
    }
  }
}
