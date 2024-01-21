import Matrix from "gl/transform/Matrix";
import { EMPTY_SPRITE, Sprite, SpriteType } from "../Sprite";
import { MediaId } from "gl/texture/ImageManager";

export class SpriteModel implements Sprite {
  sprite: Sprite = EMPTY_SPRITE;
  animationId: number = 0;
  flip: boolean = false;
  imageId: MediaId = 0;
  readonly transform: Matrix = Matrix.create();

  get name(): string | undefined {
    return this.sprite.name;
  }
  get spriteType(): SpriteType | undefined {
    return this.sprite.spriteType;
  }
}
