import Matrix from "gl/transform/Matrix";
import { Sprites } from "../Sprites";
import { Sprite, copySprite } from "../Sprite";
import { Flippable } from "../Flippable";
import { IMatrix } from "gl/transform/IMatrix";
import { SpriteUpdateType } from "../update/SpriteUpdateType";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { SpritesHolder } from "./SpritesHolder";
import { forEach } from "../List";
import { AnimationId } from "animation/Animation";

export class SpriteGroup implements Sprites, Flippable, Auxiliary<SpritesHolder> {
  private _flip?: boolean;
  private _animationId?: AnimationId;
  private _active = false;
  holder?: SpritesHolder;

  private spriteModel: Sprite = {
    imageId: 0,
    transform: Matrix.create(),
  };

  constructor(private children: Sprites | (Sprite[] & Partial<UpdateNotifier>), public transforms: IMatrix[] = []) {
  }

  get length(): number {
    return this.children.length;
  }

  set flip(value: boolean) {
    if (this._flip !== value) {
      this._flip = value;
      forEach(this.children, (_, index) => this.informUpdate(index, SpriteUpdateType.TEX_SLOT));
    }
  }

  set animationId(value: AnimationId) {
    if (this._animationId !== value) {
      this._animationId = value;
      forEach(this.children, (_, index) => this.informUpdate(index, SpriteUpdateType.ANIM));
    }
  }

  get flip() {
    return !!this._flip;
  }

  at(index: number): Sprite | undefined {
    if (!this._active) {
      return undefined;
    }
    const s = this.children.at(index);
    if (!s) {
      return undefined;
    }
    copySprite(s, this.spriteModel);
    for (let transform of this.transforms) {
      this.spriteModel.transform.multiply2(transform, this.spriteModel.transform);
    }
    this.spriteModel.flip = !!this.flip;
    this.spriteModel.animationId = this._animationId ?? this.spriteModel.animationId;
    return this.spriteModel;
  }

  informUpdate(id: number, type?: SpriteUpdateType | undefined): void {
    this.children.informUpdate?.(id, type);
  }

  activate(): void {
    if (!this._active) {
      this._active = true;
      this.holder?.add?.(this);
      forEach(this.children, (_, index) => this.informUpdate(index));
    }
  }

  deactivate(): void {
    if (this._active) {
      this._active = false;
      forEach(this.children, (_, index) => this.informUpdate(index));
    }
  }
}
