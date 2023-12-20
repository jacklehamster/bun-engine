import { Sprite, SpriteId } from "world/sprite/Sprite";
import { Refresh } from "./Refresh";
import { GraphicsEngine } from "core/GraphicsEngine";
import { Motor } from "core/Motor";

export class SpriteAnimUpdate implements Refresh {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private motor: Motor, private getSprite: (spriteId: SpriteId) => Sprite | undefined, private engine: GraphicsEngine) {
  }

  withSpriteId(spriteId: SpriteId): SpriteAnimUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  refresh(): void {
    this.engine.updateSpriteAnims(this.updatedSpriteIds, this.getSprite);
    if (this.updatedSpriteIds.size) { //  re-register if some updates are remaining
      this.motor.registerUpdate(this);
    }
  }
}
