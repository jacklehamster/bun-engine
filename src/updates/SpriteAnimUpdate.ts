import { Sprite, SpriteId } from "world/Sprite";
import { Update, UpdatePayload } from "./Update";
import { GraphicsEngine } from "core/GraphicsEngine";

export class SpriteAnimUpdate implements Update {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private getSprite: (spriteId: SpriteId) => Sprite | undefined, private engine: GraphicsEngine) {
  }

  withSpriteId(spriteId: SpriteId): SpriteAnimUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  update({ motor }: UpdatePayload): void {
    this.engine.updateSpriteAnims(this.updatedSpriteIds, this.getSprite);
    if (this.updatedSpriteIds.size) {
      motor.registerUpdate(this);
    }
  }
}
