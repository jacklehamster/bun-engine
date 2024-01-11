import { FloatUniform, VectorUniform } from "./Uniforms";
import { MatrixUniform } from "./Uniforms";
import { MediaId } from "gl/texture/ImageManager";
import { Media } from "gl/texture/Media";
import { MediaData } from "gl/texture/MediaData";
import { vector } from "gl/transform/IMatrix";
import { Auxiliary } from "world/aux/Auxiliary";
import { SpriteId } from "world/sprite/Sprite";
import { Sprites } from "world/sprite/Sprites";

export interface IGraphicsEngine extends Auxiliary {
  setMaxSpriteCount(spriteCount: number): void;
  setBgColor(rgb: vector): void;
  updateTextures(imageIds: MediaId[], getMedia: (imageId: MediaId) => Media | undefined): Promise<MediaData[]>;
  updateSpriteTransforms(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateSpriteAnims(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateCameraMatrix(type: MatrixUniform, matrix: Float32Array): void;
  updateCameraFloat(type: FloatUniform, value: number): void;
  updateCameraVector(type: VectorUniform, value: vector): void;
  setPixelListener(listener: { x: number, y: number, setPixel(value: number): void }): void;
  addResizeListener(listener: (w: number, h: number) => void): () => void;
}
