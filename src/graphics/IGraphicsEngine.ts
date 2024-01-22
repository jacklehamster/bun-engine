import { Animation, AnimationId } from "animation/Animation";
import { FloatUniform, VectorUniform } from "./Uniforms";
import { MatrixUniform } from "./Uniforms";
import { MediaId } from "gl/texture/ImageManager";
import { MediaData } from "gl/texture/MediaData";
import { IMatrix } from "gl/transform/IMatrix";
import { Vector } from "core/types/Vector";
import { Auxiliary } from "world/aux/Auxiliary";
import { Sprite, SpriteId } from "world/sprite/Sprite";
import { Media } from "gl/texture/Media";
import { List } from "world/sprite/List";

export interface IGraphicsEngine extends Auxiliary {
  setMaxSpriteCount(spriteCount: number): void;
  setBgColor(rgb: Vector): void;
  updateTextures(imageIds: Set<MediaId>, medias: List<Media>): Promise<MediaData[]>;
  updateSpriteTransforms(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateSpriteTexSlots(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateSpriteTypes(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateSpriteAnimations(spriteIds: Set<SpriteId>, sprites: List<Sprite>): void;
  updateAnimationDefinitions(ids: Set<AnimationId>, animations: List<Animation>): void;
  updateUniformMatrix(type: MatrixUniform, matrix: IMatrix): void;
  updateUniformFloat(type: FloatUniform, value: number): void;
  updateUniformVector(type: VectorUniform, value: Vector): void;
  setPixelListener(listener: { x: number, y: number, setPixel(value: number): void }): void;
  resetViewportSize(): void;
}
