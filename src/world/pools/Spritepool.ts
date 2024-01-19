import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";
import { ObjectPool } from "utils/ObjectPool";
import { Sprite } from "world/sprite/Sprite";

export class SpritePool extends ObjectPool<Sprite, [MediaId]> {
  constructor() {
    super((sprite, imageId): Sprite => {
      if (!sprite) {
        return { imageId, transform: Matrix.create() };
      }
      sprite.imageId = imageId;
      sprite.transform.identity();
      return sprite;
    });
  }
}
