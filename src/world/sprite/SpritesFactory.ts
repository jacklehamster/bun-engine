import { Cell } from "cell-tracker";
import { Sprite } from "./Sprite";
import { MediaId } from "gl-texture-manager";
import { IElemFactory } from "./aux/IElemFactory";
import { SpritePool } from "world/sprite/pools/SpritePool";
import { alea } from "seedrandom"
import { List } from "abstract-list";

interface SpriteBag {
  createSprite(imageId?: MediaId): Sprite;
  addSprite(...sprite: Sprite[]): void;
}

interface CellSpriteFiller {
  fillSpriteBag(cell: Cell, bag: SpriteBag, rng: () => number): void;
}

export class SpriteFactory implements IElemFactory<Sprite> {
  private readonly sprites: Sprite[] = [];
  private readonly pool: SpritePool = new SpritePool();
  private readonly spriteBag: SpriteBag = {
    createSprite: (imageId?: MediaId): Sprite => this.pool.create(imageId ?? 0),
    addSprite: (...sprites: Sprite[]) => this.sprites.push(...sprites),
  };

  constructor(private filler: CellSpriteFiller) {
  }

  getElemsAtCell(cell: Cell): List<Sprite> {
    this.filler.fillSpriteBag(cell, this.spriteBag, alea(cell.tag));
    return this.sprites;
  }

  doneCellTracking(): void {
    this.pool.recycleAll();
    this.sprites.length = 0;
  }
}
