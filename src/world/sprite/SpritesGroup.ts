import Matrix from "gl/transform/Matrix";
import { Sprites } from "./Sprites";
import { Sprite } from "./Sprite";

export class SpriteGroup implements Sprites {
  private spriteModel: Sprite = {
    imageId: 0,
    transform: Matrix.create(),
  };

  constructor(private children: Sprites, public transform: Matrix = Matrix.create().identity()) {
  }

  get length(): number {
    return this.children.length;
  }

  at(index: number): Sprite | undefined {
    const s = this.children.at(index);
    if (!s) {
      return undefined;
    }
    this.spriteModel.name = `s${index}`;
    this.spriteModel.imageId = s.imageId;
    this.spriteModel.transform.identity().multiply2(this.transform, s.transform);
    return this.spriteModel;
  }

  informUpdate(id: number, type?: number | undefined): void {
    this.children.informUpdate?.(id, type);
  }
}
