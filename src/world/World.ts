import Matrix from "gl/transform/Matrix";
import { Sprite } from "./Sprite";
import { ImageId } from "gl/texture/ImageManager";

interface World {
  getSpriteCount(): number;
  getSprite(index: number): Sprite;
  getHudMatrix(): Matrix;
  getNumImages(): number;
  drawImage(imageId: ImageId, ctx: OffscreenCanvasRenderingContext2D): void;
  getHudSpriteId(): number;
}

export default World;
