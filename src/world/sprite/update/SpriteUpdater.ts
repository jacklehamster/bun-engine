import { UpdateNotifier } from "updates/UpdateNotifier";
import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { SpriteUpdateType } from "./SpriteUpdateType";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export abstract class SpriteUpdater implements Sprites, UpdateNotifier {
  private readonly spriteTransformUpdate;
  private readonly spriteAnimUpdate;

  constructor({ engine, motor }: Props) {
    this.spriteTransformUpdate = new UpdateRegistry((ids) => engine.updateSpriteTransforms(ids, this), motor);
    this.spriteAnimUpdate = new UpdateRegistry((ids) => engine.updateSpriteAnims(ids, this), motor);
  }

  abstract get length(): number;
  abstract at(index: number): Sprite | undefined;

  informUpdate(id: number, type: number = SpriteUpdateType.ALL): void {
    if (id < this.length) {
      if (type & SpriteUpdateType.TRANSFORM) {
        this.spriteTransformUpdate.informUpdate(id);
      }
      if (type & SpriteUpdateType.ANIM) {
        this.spriteAnimUpdate.informUpdate(id);
      }
    }
  }
}
