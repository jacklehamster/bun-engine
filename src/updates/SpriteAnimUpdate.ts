import { Sprite, SpriteId } from "world/Sprite";
import { Update } from "./Update";
import { GraphicsEngine } from "core/GraphicsEngine";
import { Motor } from "core/Motor";

export class SpriteAnimUpdate implements Update {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private motor: Motor, private getSprite: (spriteId: SpriteId) => Sprite | undefined, private engine: GraphicsEngine) {
  }

  withSpriteId(spriteId: SpriteId): SpriteAnimUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  update(): void {
    this.engine.updateSpriteAnims(this.updatedSpriteIds, this.getSprite);
    if (this.updatedSpriteIds.size) {
      this.motor.registerUpdate(this);
    }
  }
}
