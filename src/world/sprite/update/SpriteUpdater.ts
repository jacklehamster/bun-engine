import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { SpriteUpdateType } from "./SpriteUpdateType";
import { Sprite, SpriteId } from "../Sprite";
import { FULL_UPDATE } from "dok-types";
import { IUpdatableList, IUpdateListener, UpdateNotifier } from "list-accumulator";
import { Active } from "dok-types";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  sprites: IUpdatableList<Sprite>;
}

export class SpriteUpdater extends UpdateNotifier implements Active, IUpdateListener {
  readonly #sprites: IUpdatableList<Sprite>;
  readonly #updateRegisteries: Record<SpriteUpdateType, UpdateRegistry>;

  constructor({ engine, motor, sprites }: Props) {
    super();
    this.#sprites = sprites;
    this.#updateRegisteries = {
      [SpriteUpdateType.TRANSFORM]: new UpdateRegistry(ids => engine.updateSpriteTransforms(ids, this.#sprites!), motor),
      [SpriteUpdateType.TEX_SLOT]: new UpdateRegistry(ids => engine.updateSpriteTexSlots(ids, this.#sprites!), motor),
      [SpriteUpdateType.TYPE]: new UpdateRegistry(ids => engine.updateSpriteTypes(ids, this.#sprites!), motor),
      [SpriteUpdateType.ANIM]: new UpdateRegistry(ids => engine.updateSpriteAnimations(ids, this.#sprites!), motor),
    };
  }

  onUpdate(id: number, type?: number | undefined): void {
    this.informUpdate(id, type);
  }

  activate(): void {
    this.#sprites.addUpdateListener?.(this);
  }

  deactivate(): void {
    this.#sprites.removeUpdateListener?.(this);
  }

  informUpdate(id: SpriteId, type: SpriteUpdateType = FULL_UPDATE): void {
    super.informUpdate(id, type);
    if (type & SpriteUpdateType.TRANSFORM) {
      this.#updateRegisteries[SpriteUpdateType.TRANSFORM].informUpdate(id);
    }
    if (type & SpriteUpdateType.TEX_SLOT) {
      this.#updateRegisteries[SpriteUpdateType.TEX_SLOT].informUpdate(id);
    }
    if (type & SpriteUpdateType.TYPE) {
      this.#updateRegisteries[SpriteUpdateType.TYPE].informUpdate(id);
    }
    if (type & SpriteUpdateType.ANIM) {
      this.#updateRegisteries[SpriteUpdateType.ANIM].informUpdate(id);
    }
  }
}
