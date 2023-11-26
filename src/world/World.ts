import { Sprite } from "./Sprite";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { GLCamera } from "gl/camera/GLCamera";

interface World {
  activate(): (() => void) | void;
  getMaxSpriteCount(): number;
  getSprite(index: number): Sprite | null;
  getUpdatedSpriteTransforms(): Set<number>;
  getUpdatedSpriteTextureSlot(): Set<number>;
  getNumImages(): number;
  drawImage(imageId: ImageId, imageManager: ImageManager): Promise<void>;
  syncWithCamera(camera: GLCamera): void;
}

export default World;
