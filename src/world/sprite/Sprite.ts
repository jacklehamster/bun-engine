import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";

export type SpriteId = number;

export enum SpriteType {
  DEFAULT = 0,
  SPRITE = 1,
  HUD = 2,
  DISTANT = 3,
}

export interface Sprite {
  name?: string;
  imageId: MediaId;
  readonly transform: Matrix;
  spriteType?: SpriteType;
}

export function copySprite(sprite: Sprite, dest?: Sprite): Sprite {
  if (!dest) {
    return {
      name: sprite.name,
      transform: Matrix.create().copy(sprite.transform),
      imageId: sprite.imageId,
      spriteType: sprite.spriteType,
    };
  }
  dest.name = sprite.name;
  dest.imageId = sprite.imageId;
  dest.spriteType = sprite.spriteType;
  dest.transform.copy(sprite.transform);
  return dest;
}
