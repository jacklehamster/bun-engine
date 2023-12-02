import { Sprite, SpriteId } from "./Sprite";
import { ImageId, ImageManager } from "gl/texture/ImageManager";
import { CameraMatrixType, Camera } from "gl/camera/Camera";
import { MediaData } from "gl/texture/MediaData";
import { Update } from "updates/Update";

interface IWorld extends Update {
  activate(): (() => void) | void;
  getMaxSpriteCount(): number;
  getSprite(index: SpriteId): Sprite | null;
  getCamera(): Camera;
  getCameraMatrix(cameraMatrixType: CameraMatrixType): Float32Array;
  getUpdatedSpriteTransforms(): Set<SpriteId>;
  getUpdatedSpriteTextureSlot(): Set<SpriteId>;
  getUpdateImageIds(): Set<ImageId>;
  drawImage(imageId: ImageId, imageManager: ImageManager): Promise<MediaData | undefined>;
}

export default IWorld;
