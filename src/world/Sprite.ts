import { ImageId } from "gl/texture/ImageManager";

export interface Sprite {
  transforms: Float32Array[];
  imageId: ImageId;
}
