import { MediaId } from "gl/texture/ImageManager";
import Matrix from "gl/transform/Matrix";

export type SpriteId = number;

export interface Sprite {
  name?: string;
  transform: Matrix;
  imageId: MediaId;
}

export function copySprite(sprite: Sprite): Sprite {
  return {
    name: sprite.name,
    transform: Matrix.create().copy(sprite.transform),
    imageId: sprite.imageId,
  };
}
