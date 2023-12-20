import { ImageId } from "gl/texture/ImageManager";
import { Sprites } from "./Sprites";

export type SpriteId = number;

export interface Sprite {
  transforms: Float32Array[];
  imageId: ImageId;
  children?: Sprites;
}
