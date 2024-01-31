import { Animation, AnimationId } from "animation/Animation";
import { MediaId, Media, MediaData } from "gl-texture-manager";
import { IMatrix } from "gl/transform/IMatrix";
import { Vector } from "core/types/Vector";
import { Auxiliary } from "world/aux/Auxiliary";
import { Sprite, SpriteId } from "world/sprite/Sprite";
import { List } from "core/List";
import { LocationName } from "gl/attributes/GLAttributeBuffers";
import { MatrixUniformHandler } from "gl/uniforms/update/MatrixUniformHandler";
import { FloatUniformHandler } from "gl/uniforms/update/FloatUniformHandler";
import { Val } from "core/value/Val";
import { VectorUniformHandler } from "gl/uniforms/update/VectorUniformHandler";

export interface IGraphicsEngine extends Auxiliary {
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
