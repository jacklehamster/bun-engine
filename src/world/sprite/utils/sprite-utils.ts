import Matrix from "gl/transform/Matrix";
import { Sprite } from "../Sprite";

export function copySprite(sprite: Sprite, dest?: Sprite): Sprite {
  if (!dest) {
    return {
      name: sprite.name,
      transform: Matrix.create().copy(sprite.transform),
      imageId: sprite.imageId,
      spriteType: sprite.spriteType,
      flip: sprite.flip,
      animationId: sprite.animationId,
    };
  }
  dest.name = sprite.name;
  dest.imageId = sprite.imageId;
  dest.spriteType = sprite.spriteType;
  dest.transform.copy(sprite.transform);
  dest.flip = sprite.flip;
  dest.animationId = sprite.animationId;
  return dest;
}
