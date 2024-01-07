import { UpdateNotifier } from "updates/UpdateNotifier";
import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { UpdateListener, UpdateRegistry } from "updates/UpdateRegistry";
import { SpriteUpdateType } from "./SpriteUpdateType";
import { UpdatePayload } from "updates/Refresh";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export abstract class SpriteUpdater implements Sprites, UpdateNotifier, UpdateListener {
  private readonly spriteTransformUpdate;
  private readonly spriteAnimUpdate;

  constructor({ engine, motor }: Props) {
    this.spriteTransformUpdate = new UpdateRegistry((ids) => engine.updateSpriteTransforms(ids, this), motor, this);
    this.spriteAnimUpdate = new UpdateRegistry((ids) => engine.updateSpriteAnims(ids, this), motor, this);
  }

  abstract onUpdate(updatePayload: UpdatePayload): void;

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
