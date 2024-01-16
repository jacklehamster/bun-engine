import Matrix from "gl/transform/Matrix";
import { Sprites } from "./Sprites";
import { Sprite } from "./Sprite";
import { IMatrix } from "gl/transform/IMatrix";
import { SpriteUpdateType } from "./update/SpriteUpdateType";

export class SpriteGroup implements Sprites {
  private spriteModel: Sprite = {
    imageId: 0,
    transform: Matrix.create(),
  };

  constructor(private children: Sprites, public transform: IMatrix = Matrix.create()) {
  }

  get length(): number {
    return this.children.length;
  }

  at(index: number): Sprite | undefined {
    const s = this.children.at(index);
    if (!s) {
      return undefined;
    }
    this.spriteModel.name = s.name;
    this.spriteModel.spriteType = s.spriteType;
    this.spriteModel.imageId = s.imageId;
    this.spriteModel.transform.multiply2(this.transform, s.transform);
    return this.spriteModel;
  }

  informUpdate(id: number, type?: SpriteUpdateType | undefined): void {
    this.children.informUpdate?.(id, type);
  }
}
