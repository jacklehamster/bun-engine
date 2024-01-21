import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";
import { ObjectPool } from "utils/ObjectPool";
import { Sprite, SpriteType } from "world/sprite/Sprite";

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
