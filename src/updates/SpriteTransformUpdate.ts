import { SpriteId } from "world/sprite/Sprite";
import { Refresh } from "./Refresh";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { Sprites } from "world/sprite/Sprites";

export class SpriteTransformUpdate implements Refresh, UpdateNotifier {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private sprites: Sprites, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(id: SpriteId): void {
    this.motor.registerUpdate(this.withSpriteId(id));
  }

  withSpriteId(spriteId: SpriteId): SpriteTransformUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  refresh(): void {
    this.engine.updateSpriteTransforms(this.updatedSpriteIds, this.sprites);
  }
}
