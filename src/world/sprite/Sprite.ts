import { AnimationId } from "animation/Animation";
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
  animationId?: AnimationId;
}

export const EMPTY_SPRITE: Sprite = {
  imageId: 0,
  transform: new Matrix,
};
