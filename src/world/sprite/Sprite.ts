import { ImageId } from "gl/texture/ImageManager";
import { List } from "./List";

export type SpriteId = number;

export interface Sprite {
  transforms: Float32Array[];
  imageId: ImageId;
  children?: Sprites;
}

export type Sprites = List<Sprite>; 
