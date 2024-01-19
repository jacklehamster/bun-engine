import { AnimationId } from "animation/Animation";
import { Animations } from "animation/Animations";
import { FloatUniform, VectorUniform } from "./Uniforms";
import { MatrixUniform } from "./Uniforms";
import { MediaId } from "gl/texture/ImageManager";
import { Medias } from "gl/texture/Medias";
import { MediaData } from "gl/texture/MediaData";
import { IMatrix } from "gl/transform/IMatrix";
import { Vector } from "core/types/Vector";
import { Auxiliary } from "world/aux/Auxiliary";
import { SpriteId } from "world/sprite/Sprite";
import { Sprites } from "world/sprite/Sprites";

export interface IGraphicsEngine extends Auxiliary {
  setMaxSpriteCount(spriteCount: number): void;
  setBgColor(rgb: Vector): void;
  updateTextures(imageIds: Set<MediaId>, medias: Medias): Promise<MediaData[]>;
  updateSpriteTransforms(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateSpriteTexSlots(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateSpriteTypes(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateSpriteAnimations(spriteIds: Set<SpriteId>, sprites: Sprites): void;
  updateAnimationDefinitions(ids: Set<AnimationId>, animations: Animations): void;
  updateUniformMatrix(type: MatrixUniform, matrix: IMatrix): void;
  updateUniformFloat(type: FloatUniform, value: number): void;
  updateUniformVector(type: VectorUniform, value: Vector): void;
  setPixelListener(listener: { x: number, y: number, setPixel(value: number): void }): void;
  resetViewportSize(): void;
}
