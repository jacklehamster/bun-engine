import { Animation, AnimationId } from "animation/Animation";
import { MediaId, Media, MediaData } from "gl-texture-manager";
import { Sprite, SpriteId } from "world/sprite/Sprite";
import { List } from "abstract-list";
import { LocationName } from "gl/attributes/GLAttributeBuffers";
import { MatrixUniformHandler } from "gl/uniforms/update/MatrixUniformHandler";
import { FloatUniformHandler } from "gl/uniforms/update/FloatUniformHandler";
import { Val } from "dok-types";
import { VectorUniformHandler } from "gl/uniforms/update/VectorUniformHandler";
import { Vector } from "dok-types";
import { IMatrix } from "dok-matrix";
import { Active } from "dok-types";

export interface IGraphicsEngine extends Active {
  setMaxSpriteCount(spriteCount: number): void;
  setBgColor(rgb: Vector): void;
  updateTextures(imageIds: Set<MediaId>, medias: List<Media>): Promise<MediaData[]>;
  updateSpriteTransforms(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateSpriteTexSlots(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateSpriteTypes(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateSpriteAnimations(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateAnimationDefinitions(ids: Set<AnimationId>, animations: List<Animation>): void;
  setPixelListener(listener: { x: number, y: number, setPixel(value: number): void }): void;
  resetViewportSize(): void;
  createMatrixUniformHandler(name: LocationName, matrix: IMatrix): MatrixUniformHandler;
  createFloatUniformHandler(name: LocationName, val?: Val<number>): FloatUniformHandler;
  createVectorUniformHandler(name: LocationName, vector: Vector): VectorUniformHandler;
}
