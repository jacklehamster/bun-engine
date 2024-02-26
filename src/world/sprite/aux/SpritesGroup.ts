import { Sprite } from "../Sprite";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { List, forEach } from "abstract-list";
import { AnimationId } from "animation/Animation";
import { ItemsGroup } from "./ItemsGroup";
import { SpriteModel } from "./SpriteModel";
import { MediaId } from "gl-texture-manager";
import { IPositionMatrix } from "dok-matrix";
import { informFullUpdate } from "list-accumulator";

export class SpriteGroup extends ItemsGroup<Sprite> {
  #orientation: number = 1;
  #animationId?: AnimationId;
  #imageId?: MediaId;
  #position;

  readonly #spriteModel: SpriteModel = new SpriteModel();

  constructor(sprites: List<Sprite>, position?: IPositionMatrix) {
    super(sprites);
    this.#position = position;
    this.#position?.addChangeListener({ onChange: () => informFullUpdate(this, SpriteUpdateType.TRANSFORM) });
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
    if (this.#position) {
      this.#spriteModel.transform.multiply2(this.#position, this.#spriteModel.transform);
    }
    this.#spriteModel.orientation = this.#orientation * (s.orientation ?? 1);
    this.#spriteModel.animationId = this.#animationId ?? s.animationId ?? 0;
    this.#spriteModel.imageId = this.#imageId ?? s.imageId;
    return this.#spriteModel;
  }
}
