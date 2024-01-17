import { Animation } from "animation/Animation";
import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";

export type SpriteId = number;
export type Frame = number;

export enum SpriteType {
  DEFAULT = 0,
  SPRITE = 1,
  HUD = 2,
  DISTANT = 3,
  SHADOW = 4,
}

export interface Flippable {
  flip?: boolean;
}

export interface Sprite extends Flippable {
  name?: string;
  imageId: MediaId;
  readonly transform: Matrix;
  spriteType?: SpriteType;
  animation?: Animation;
}

export function copySprite(sprite: Sprite, dest?: Sprite): Sprite {
  if (!dest) {
    return {
      name: sprite.name,
      transform: Matrix.create().copy(sprite.transform),
      imageId: sprite.imageId,
      spriteType: sprite.spriteType,
      flip: sprite.flip,
      animation: {
        ...sprite.animation,
      },
    };
  }
  dest.name = sprite.name;
  dest.imageId = sprite.imageId;
  dest.spriteType = sprite.spriteType;
  dest.transform.copy(sprite.transform);
  dest.flip = sprite.flip;
  dest.animation = dest.animation ?? { frames: [0, 0] };
  dest.animation.frames = dest.animation.frames ?? [0, 0];
  dest.animation.frames[0] = sprite.animation?.frames?.[0] ?? 0;
  dest.animation.frames[1] = sprite.animation?.frames?.[1] ?? dest.animation.frames[0];
  dest.animation.fps = sprite.animation?.fps;
  dest.animation.maxFrameCount = sprite.animation?.maxFrameCount;
  return dest;
}
