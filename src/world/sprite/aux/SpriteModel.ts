import { Matrix } from "dok-matrix";
import { EMPTY_SPRITE, Sprite } from "../Sprite";
import { SpriteType } from "../SpriteType";
import { MediaId } from "gl-texture-manager";

export class SpriteModel implements Sprite {
  sprite: Sprite = EMPTY_SPRITE;
  animationId: number = 0;
  orientation: number = 1;
  imageId: MediaId = 0;
  readonly transform: Matrix = Matrix.create();

  get spriteType(): SpriteType | undefined {
    return this.sprite.spriteType;
  }

  get hidden(): boolean | undefined {
    return this.sprite.hidden;
  }
}
