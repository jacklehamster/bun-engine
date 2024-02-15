import { FULL_UPDATE, IUpdateListener } from "updates/IUpdateNotifier";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { SpriteUpdateType } from "./SpriteUpdateType";
import { Auxiliary } from "world/aux/Auxiliary";
import { Sprite, SpriteId } from "../Sprite";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { UpdatableList } from "core/UpdatableList";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  sprites: UpdatableList<Sprite>;
}

export class SpriteUpdater extends UpdateNotifier implements Auxiliary, IUpdateListener {
  private readonly sprites: UpdatableList<Sprite>;
  private readonly updateRegisteries: Record<SpriteUpdateType, UpdateRegistry | undefined>;

  constructor({ engine, motor, sprites }: Props) {
    super();
    this.sprites = sprites;
    this.updateRegisteries = {
      [SpriteUpdateType.TRANSFORM]: new UpdateRegistry(ids => engine.updateSpriteTransforms(ids, this.sprites!), motor),
      [SpriteUpdateType.TEX_SLOT]: new UpdateRegistry(ids => engine.updateSpriteTexSlots(ids, this.sprites!), motor),
      [SpriteUpdateType.TYPE]: new UpdateRegistry(ids => engine.updateSpriteTypes(ids, this.sprites!), motor),
      [SpriteUpdateType.ANIM]: new UpdateRegistry(ids => engine.updateSpriteAnimations(ids, this.sprites!), motor),
    };
  }

  onUpdate(id: number, type?: number | undefined): void {
    this.informUpdate(id, type);
  }

  activate(): void {
    this.sprites.addUpdateListener?.(this);
  }

  deactivate(): void {
    this.sprites.removeUpdateListener?.(this);
  }

  informUpdate(id: SpriteId, type: SpriteUpdateType = FULL_UPDATE): void {
    super.informUpdate(id, type);
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
