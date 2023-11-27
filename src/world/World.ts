import { Sprite, SpriteId } from "./Sprite";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { GLCamera } from "gl/camera/GLCamera";

interface World {
  activate(): (() => void) | void;
  getMaxSpriteCount(): number;
  getSprite(index: SpriteId): Sprite | null;
  getUpdatedSpriteTransforms(): Set<SpriteId>;
  getUpdatedSpriteTextureSlot(): Set<SpriteId>;
  getUpdateImageIds(): Set<ImageId>;
  drawImage(imageId: ImageId, imageManager: ImageManager): Promise<void>;
  syncWithCamera(camera: GLCamera): void;
}

export default World;
