import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";

export type SpriteId = number;

export enum SpriteType {
  DEFAULT = 0,
  SPRITE = 1,
  HUD = 2,
  DISTANT = 3,
}

export interface Flippable {
  flip?: boolean;
}

export interface Sprite extends Flippable {
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
      flip: sprite.flip,
    };
  }
  dest.name = sprite.name;
  dest.imageId = sprite.imageId;
  dest.spriteType = sprite.spriteType;
  dest.transform.copy(sprite.transform);
  dest.flip = sprite.flip;
  return dest;
}
