import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";

export type SpriteId = number;

export interface Sprite {
  id?: SpriteId;
  transform: Matrix;
  imageId: MediaId;
}
