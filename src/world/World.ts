import { Sprite, SpriteId } from "./Sprite";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { CameraMatrixType, Camera } from "gl/camera/Camera";

interface World {
  activate(): (() => void) | void;
  getMaxSpriteCount(): number;
  getSprite(index: SpriteId): Sprite | null;
  getCamera(): Camera;
  getCameraMatrix(cameraMatrixType: CameraMatrixType): Float32Array;
  getUpdatedSpriteTransforms(): Set<SpriteId>;
  getUpdatedSpriteTextureSlot(): Set<SpriteId>;
  getUpdatedCamMatrices(): Set<CameraMatrixType>
  getUpdateImageIds(): Set<ImageId>;
  drawImage(imageId: ImageId, imageManager: ImageManager): Promise<void>;
  refresh?(deltaTime: number): void;
}

export default World;
