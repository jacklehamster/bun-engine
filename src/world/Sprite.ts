import { ImageId } from "gl/texture/ImageManager";

export type SpriteId = number;

export interface Sprite {
  transforms: Float32Array[];
  imageId: ImageId;
}
