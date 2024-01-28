import { ObjectPool } from "bun-pool";
import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";
import { Sprite } from "world/sprite/Sprite";
import { SpriteType } from "world/sprite/SpriteType";

export class SpritePool extends ObjectPool<Sprite, [MediaId]> {
  constructor() {
    super((sprite, imageId): Sprite => {
      if (!sprite) {
        return { imageId, transform: Matrix.create() };
      }
      sprite.imageId = imageId;
      sprite.transform.identity();
      sprite.spriteType = SpriteType.DEFAULT;
      return sprite;
    });
  }
}
