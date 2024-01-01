import { SpriteId } from "world/sprite/Sprite";
import { Refresh } from "./Refresh";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { Sprites } from "world/sprite/Sprites";

export class SpriteAnimUpdate implements Refresh, UpdateNotifier {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private sprites: Sprites, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(id: SpriteId): void {
    this.motor.registerUpdate(this.withSpriteId(id))
  }

  withSpriteId(spriteId: SpriteId): SpriteAnimUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  refresh(): void {
    this.engine.updateSpriteAnims(this.updatedSpriteIds, this.sprites);
    if (this.updatedSpriteIds.size) { //  re-register if some updates are remaining
      this.motor.registerUpdate(this);
    }
  }
}
