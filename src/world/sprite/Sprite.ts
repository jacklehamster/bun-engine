import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";

export type SpriteId = number;

export enum SpriteType {
  DEFAULT = 0,
  SPRITE = 1,
}

export interface Sprite {
  readonly transform: Matrix;
  imageId: MediaId;
  spriteType?: SpriteType;
}

export function copySprite(sprite: Sprite, dest?: Sprite): Sprite {
  if (!dest) {
    return {
      transform: Matrix.create().copy(sprite.transform),
      imageId: sprite.imageId,
      spriteType: sprite.spriteType,
    };
  }
  dest.imageId = sprite.imageId;
  dest.spriteType = sprite.spriteType;
  dest.transform.copy(sprite.transform);
  return dest;
}
