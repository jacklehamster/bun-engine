import { AnimationId } from "animation/Animation";
import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";
import { SpriteType } from "./SpriteType";

export type SpriteId = number;
export type Frame = number;

export interface Flippable {
  orientation?: number;
}

export interface Sprite extends Flippable {
  imageId: MediaId;
  readonly transform: Matrix;
  spriteType?: SpriteType;
  animationId?: AnimationId;
  hidden?: boolean;
}

export const EMPTY_SPRITE: Sprite = {
  imageId: 0,
  transform: new Matrix(),
};
