import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { IMatrix } from "gl/transform/IMatrix";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { forEach } from "../../../core/List";
import { AnimationId } from "animation/Animation";
import { ItemsGroup } from "./ItemsGroup";
import { Animatable as Animating } from "animation/Animatable";
import { SpriteModel } from "./SpriteModel";
import { MediaId } from "gl-texture-manager";

export class SpriteGroup extends ItemsGroup<Sprite> implements Animating {
  private _orientation: number = 1;
  private _animationId?: AnimationId;
  private _imageId?: MediaId;

  private readonly spriteModel: SpriteModel = new SpriteModel();

  constructor(sprites: Sprites, public transforms: IMatrix[] = []) {
    super(sprites);
  }

  setOrientation(value: number) {
    if (this._orientation !== value) {
      this._orientation = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.TEX_SLOT));
    }
  }

  setAnimationId(value: AnimationId) {
    if (this._animationId !== value) {
      this._animationId = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.ANIM));
    }
  }

  setImageId(value: MediaId) {
    if (this._imageId !== value) {
      this._imageId = value;
      forEach(this.elems, (_, index) => this.informUpdate(index, SpriteUpdateType.TEX_SLOT));
    }
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
    this.spriteModel.orientation = this._orientation * (s.orientation ?? 1);
    this.spriteModel.animationId = this._animationId ?? s.animationId ?? 0;
    this.spriteModel.imageId = this._imageId ?? s.imageId;
    return this.spriteModel;
  }

  informUpdate(id: number, type?: SpriteUpdateType | undefined): void {
    super.informUpdate(id, type);
    this.elems.informUpdate?.(id, type);
  }
}
