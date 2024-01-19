import { Sprites } from "./Sprites";
import { Cell } from "world/grid/CellPos";
import { UpdatePayload } from "updates/Refresh";
import { Sprite } from "./Sprite";
import { MediaId } from "gl/texture/ImageManager";
import { IElemFactory } from "./aux/IElemFactory";
import { SpritePool } from "world/pools/Spritepool";

interface SpriteBag {
  createSprite(imageId?: MediaId): Sprite;
  addSprite(...sprite: Sprite[]): void;
}

interface CellSpriteFiller {
  fillSpriteBag(cell: Cell, updatePayload: UpdatePayload, bag: SpriteBag): void;
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

  getElemsAtCell(cell: Cell, updatePayload: UpdatePayload): Sprites {
    this.filler.fillSpriteBag(cell, updatePayload, this.spriteBag);
    return this.sprites;
  }

  doneCellTracking(): void {
    this.pool.reset();
    this.sprites.length = 0;
  }
}
