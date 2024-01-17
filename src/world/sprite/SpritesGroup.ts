import Matrix from "gl/transform/Matrix";
import { Sprites } from "./Sprites";
import { Flippable, Sprite, copySprite } from "./Sprite";
import { IMatrix } from "gl/transform/IMatrix";
import { SpriteUpdateType } from "./update/SpriteUpdateType";
import { UpdateNotifier } from "updates/UpdateNotifier";

export class SpriteGroup implements Sprites, Flippable {
  flip: boolean = false;

  private spriteModel: Sprite = {
    imageId: 0,
    transform: Matrix.create(),
  };

  constructor(private children: Sprites | (Sprite[] & Partial<UpdateNotifier>), public transforms: IMatrix[] = []) {
  }

  get length(): number {
    return this.children.length;
  }

  at(index: number): Sprite | undefined {
    const s = this.children.at(index);
    if (!s) {
      return undefined;
    }
    copySprite(s, this.spriteModel);
    for (let transform of this.transforms) {
      this.spriteModel.transform.multiply2(transform, this.spriteModel.transform);
    }
    if (this.flip) {
      this.spriteModel.flip = !this.spriteModel.flip;
    }
    return this.spriteModel;
  }

  informUpdate(id: number, type?: SpriteUpdateType | undefined): void {
    this.children.informUpdate?.(id, type);
  }
}
