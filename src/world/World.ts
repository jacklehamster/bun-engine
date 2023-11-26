import { Sprite } from "./Sprite";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { GLCamera } from "gl/camera/GLCamera";

interface World {
  activate(): (() => void) | void;
  getSpriteCount(): number;
  getSprite(index: number): Sprite;
  getNumImages(): number;
  drawImage(imageId: ImageId, imageManager: ImageManager): Promise<void>;
  syncWithCamera(camera: GLCamera): void;
  getUpdatedSprites(): Set<number>;
}

export default World;
