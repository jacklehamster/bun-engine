import { Sprites } from "./Sprites";
import { Cell } from "world/grid/CellPos";
import { UpdatePayload } from "updates/Refresh";
import { Sprite } from "./Sprite";
import { ObjectPool } from "utils/ObjectPool";
import Matrix from "gl/transform/Matrix";
import { MediaId } from "gl/texture/ImageManager";
import { ISpriteFactory } from "./aux/ISpriteFactory";

interface SpriteBag {
  createSprite(imageId?: MediaId): Sprite;
  addSprite(...sprite: Sprite[]): void;
}

interface CellSpriteFiller {
  fillSpriteBag(cell: Cell, updatePayload: UpdatePayload, bag: SpriteBag): void;
}

export class SpriteFactory implements ISpriteFactory {
  private sprites: Sprite[] = [];
  private pool: ObjectPool<Sprite, [MediaId]> = new ObjectPool<Sprite, [MediaId]>((sprite, imageId): Sprite => {
    if (!sprite) {
      return { imageId, transform: Matrix.create() };
    }
    sprite.imageId = imageId;
    sprite.transform.identity();
    return sprite;
  });

  private spriteBag: SpriteBag = {
    createSprite: (imageId?: MediaId): Sprite => {
      return this.pool.create(imageId ?? 0);
    },
    addSprite: (...sprites: Sprite[]) => {
      this.sprites.push(...sprites);
    },
  };

  constructor(private filler: CellSpriteFiller) {
  }

  getSpritesAtCell(cell: Cell, updatePayload: UpdatePayload): Sprites {
    this.filler.fillSpriteBag(cell, updatePayload, this.spriteBag);
    return this.sprites;
  }

  doneCellTracking(): void {
    this.pool.reset();
    this.sprites.length = 0;
  }
}
