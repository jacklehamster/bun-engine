import Matrix from "gl/transform/Matrix";
import { EMPTY_SPRITE, Sprite, SpriteType } from "../Sprite";

export class SpriteModel implements Sprite {
  sprite: Sprite = EMPTY_SPRITE;
  animationId: number = 0;
  flip: boolean = false;
  readonly transform: Matrix = Matrix.create();

  get name(): string | undefined {
    return this.sprite.name;
  }
  get imageId(): number {
    return this.sprite.imageId;
  }
  get spriteType(): SpriteType | undefined {
    return this.sprite.spriteType;
  }
}
