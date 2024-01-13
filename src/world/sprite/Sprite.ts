import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";

export type SpriteId = number;

export enum SpriteType {
  DEFAULT = 0,
  SPRITE = 1,
}

export interface Sprite {
  transform: Matrix;
  imageId: MediaId;
  spriteType?: SpriteType;
}

export function copySprite(sprite: Sprite): Sprite {
  return {
    transform: Matrix.create().copy(sprite.transform),
    imageId: sprite.imageId,
    spriteType: sprite.spriteType,
  };
}
