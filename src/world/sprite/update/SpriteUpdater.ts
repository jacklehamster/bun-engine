import { UpdateNotifier } from "updates/UpdateNotifier";
import { Sprites } from "../Sprites";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { SpriteUpdateType } from "./SpriteUpdateType";
import { Auxiliary } from "world/aux/Auxiliary";
import { SpritesHolder } from "../aux/SpritesHolder";
import { SpriteId } from "../Sprite";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class SpriteUpdater implements UpdateNotifier, Auxiliary<SpritesHolder> {
  private readonly spriteTransformUpdate;
  private readonly spriteAnimUpdate;
  private sprites?: Sprites;

  set holder(value: SpritesHolder) {
    this.sprites = value;
    value.informUpdate = this.informUpdate.bind(this);
  }

  constructor({ engine, motor }: Props) {
    this.spriteTransformUpdate = new UpdateRegistry((ids) => engine.updateSpriteTransforms(ids, this.sprites!), motor);
    this.spriteAnimUpdate = new UpdateRegistry((ids) => engine.updateSpriteAnims(ids, this.sprites!), motor);
  }

  informUpdate(id: SpriteId, type: SpriteUpdateType = SpriteUpdateType.ALL): void {
    if (this.sprites && id < this.sprites.length) {
      if (type & SpriteUpdateType.TRANSFORM) {
        this.spriteTransformUpdate.informUpdate(id);
      }
      if (type & SpriteUpdateType.ANIM) {
        this.spriteAnimUpdate.informUpdate(id);
      }
    }
  }
}
