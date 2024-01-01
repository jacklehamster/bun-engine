import { CameraFloatType, CameraMatrixType } from "gl/camera/Camera";
import { MediaId } from "gl/texture/ImageManager";
import { Media } from "gl/texture/Media";
import { MediaData } from "gl/texture/MediaData";
import { Auxiliary } from "world/aux/Auxiliary";
import { SpriteId } from "world/sprite/Sprite";
import { Sprites } from "world/sprite/Sprites";

export interface IGraphicsEngine extends Auxiliary {
  setMaxSpriteCount(spriteCount: number): void;
  updateTextures(imageIds: MediaId[], getMedia: (imageId: MediaId) => Media | undefined): Promise<MediaData[]>;
  updateSpriteTransforms(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateSpriteAnims(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateCameraMatrix(type: CameraMatrixType, matrix: Float32Array): void;
  updateCameraFloat(type: CameraFloatType, value: number): void;
  addPixelListener(listener: { x: number, y: number, pixel: number }): () => void;
  addResizeListener(listener: (w: number, h: number) => void): () => void;
}
