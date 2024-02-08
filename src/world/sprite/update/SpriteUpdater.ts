import { UpdateNotifier } from "updates/UpdateNotifier";
import { Sprites } from "../Sprites";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { SpriteUpdateType } from "./SpriteUpdateType";
import { Auxiliary } from "world/aux/Auxiliary";
import { SpriteId } from "../Sprite";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  sprites: Sprites;
}

export class SpriteUpdater implements UpdateNotifier, Auxiliary {
  private readonly sprites: Sprites;
  private readonly updateRegisteries: Record<SpriteUpdateType, UpdateRegistry | undefined>;

  constructor({ engine, motor, sprites }: Props) {
    this.sprites = sprites;
    this.updateRegisteries = {
      [SpriteUpdateType.NONE]: undefined,
      [SpriteUpdateType.TRANSFORM]: new UpdateRegistry(ids => engine.updateSpriteTransforms(ids, this.sprites!), motor),
      [SpriteUpdateType.TEX_SLOT]: new UpdateRegistry(ids => engine.updateSpriteTexSlots(ids, this.sprites!), motor),
      [SpriteUpdateType.TYPE]: new UpdateRegistry(ids => engine.updateSpriteTypes(ids, this.sprites!), motor),
      [SpriteUpdateType.ANIM]: new UpdateRegistry(ids => engine.updateSpriteAnimations(ids, this.sprites!), motor),
      [SpriteUpdateType.ALL]: undefined,
    };
  }

  activate(): void {
    this.sprites.informUpdate = this.informUpdate.bind(this);
  }

  informUpdate(id: SpriteId, type: SpriteUpdateType = SpriteUpdateType.ALL): void {
    if (type & SpriteUpdateType.TRANSFORM) {
      this.updateRegisteries[SpriteUpdateType.TRANSFORM]!.informUpdate(id);
    }
    if (type & SpriteUpdateType.TEX_SLOT) {
      this.updateRegisteries[SpriteUpdateType.TEX_SLOT]!.informUpdate(id);
    }
    if (type & SpriteUpdateType.TYPE) {
      this.updateRegisteries[SpriteUpdateType.TYPE]!.informUpdate(id);
    }
    if (type & SpriteUpdateType.ANIM) {
      this.updateRegisteries[SpriteUpdateType.ANIM]!.informUpdate(id);
    }
  }
}
