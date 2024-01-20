import { AnimationId } from "./Animation";

export interface Animatable {
  setAnimationId(value: AnimationId): void;
}
