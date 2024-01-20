import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { IMatrix } from "gl/transform/IMatrix";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { forEach } from "../List";
import { AnimationId } from "animation/Animation";
import { ItemsGroup } from "./ItemsGroup";
import { Animatable as Animating } from "animation/Animatable";
import { SpriteModel } from "./SpriteModel";

export class SpriteGroup extends ItemsGroup<Sprite> implements Animating {
  private _flip?: boolean;
  private _animationId?: AnimationId;

  private readonly spriteModel: SpriteModel = new SpriteModel();

  constructor(sprites: Sprites | (Sprite[] & Partial<UpdateNotifier>), public transforms: IMatrix[] = []) {
    super(sprites);
  }

  set flip(value: boolean) {
    if (this._flip !== value) {
      this._flip = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.TEX_SLOT));
    }
  }

  setAnimationId(value: AnimationId) {
    if (this._animationId !== value) {
      this._animationId = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.ANIM));
    }
  }

  get flip() {
    return !!this._flip;
  }

  at(index: number): Sprite | undefined {
    const s = super.at(index);
    if (!s) {
      return undefined;
    }
    this.spriteModel.sprite = s;
    this.spriteModel.transform.copy(s.transform);
    for (let transform of this.transforms) {
      this.spriteModel.transform.multiply2(transform, this.spriteModel.transform);
    }
    this.spriteModel.flip = !!this.flip;
    this.spriteModel.animationId = this._animationId ?? this.spriteModel.animationId;
    return this.spriteModel;
  }

  informUpdate(id: number, type?: SpriteUpdateType | undefined): void {
    this.elems.informUpdate?.(id, type);
  }
}
