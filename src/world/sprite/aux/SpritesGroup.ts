import { Sprite } from "../Sprite";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { List, forEach } from "abstract-list";
import { AnimationId } from "animation/Animation";
import { ItemsGroup } from "./ItemsGroup";
import { Animatable as Animating } from "animation/Animatable";
import { SpriteModel } from "./SpriteModel";
import { MediaId } from "gl-texture-manager";
import { IMatrix } from "dok-matrix";

export class SpriteGroup extends ItemsGroup<Sprite> implements Animating {
  #orientation: number = 1;
  #animationId?: AnimationId;
  #imageId?: MediaId;

  readonly #spriteModel: SpriteModel = new SpriteModel();

  constructor(sprites: List<Sprite>, private transforms: IMatrix[] = []) {
    super(sprites);
  }

  setOrientation(value: number) {
    if (this.#orientation !== value) {
      this.#orientation = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.TEX_SLOT));
    }
  }

  setAnimationId(value: AnimationId) {
    if (this.#animationId !== value) {
      this.#animationId = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.ANIM));
    }
  }

  setImageId(value: MediaId) {
    if (this.#imageId !== value) {
      this.#imageId = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.TEX_SLOT));
    }
  }

  at(index: number): Sprite | undefined {
    const s = super.at(index);
    if (!s) {
      return undefined;
    }
    this.#spriteModel.sprite = s;
    this.#spriteModel.transform.copy(s.transform);
    for (let transform of this.transforms) {
      this.#spriteModel.transform.multiply2(transform, this.#spriteModel.transform);
    }
    this.#spriteModel.orientation = this.#orientation * (s.orientation ?? 1);
    this.#spriteModel.animationId = this.#animationId ?? s.animationId ?? 0;
    this.#spriteModel.imageId = this.#imageId ?? s.imageId;
    return this.#spriteModel;
  }

  informUpdate(id: number, type?: SpriteUpdateType | undefined): void {
    super.informUpdate(id, type);
    this.elems.informUpdate?.(id, type);
  }
}
