import { AnimationId } from "animation/Animation";
import { MediaId } from "gl-texture-manager";
import { SpriteType } from "./SpriteType";
import { Matrix } from "dok-matrix";

export type SpriteId = number;
export type Frame = number;

export interface Sprite {
  spriteType?: SpriteType;
  imageId: MediaId;
  animationId?: AnimationId;
  readonly transform: Matrix;
  orientation?: number;
  hidden?: boolean;
}

export const EMPTY_SPRITE: Sprite = {
  imageId: 0,
  transform: new Matrix(),
};
