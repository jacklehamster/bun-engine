import { CameraFloatType, CameraMatrixType } from "gl/camera/Camera";
import { MediaId } from "gl/texture/ImageManager";
import { Media } from "gl/texture/Media";
import { MediaData } from "gl/texture/MediaData";
import { Auxiliary } from "world/aux/Auxiliary";
import { Sprite, SpriteId } from "world/sprite/Sprite";

export interface IGraphicsEngine extends Auxiliary {
  setMaxSpriteCount(spriteCount: number): void;
  updateTextures(imageIds: MediaId[], getMedia: (imageId: MediaId) => Media | undefined): Promise<MediaData[]>;
  updateSpriteTransforms(spriteIds: Set<SpriteId>, getSprite: (spriteId: SpriteId) => Sprite | undefined): void;
  updateSpriteAnims(spriteIds: Set<SpriteId>, getSprite: (spriteId: SpriteId) => Sprite | undefined): void;
  updateCameraMatrix(type: CameraMatrixType, matrix: Float32Array): void;
  updateCameraFloat(type: CameraFloatType, value: number): void;
  addPixelListener(listener: { x: number, y: number, pixel: number }): () => void;
  addResizeListener(listener: (w: number, h: number) => void): () => void;
}
