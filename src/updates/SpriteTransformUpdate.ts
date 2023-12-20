import { Sprite, SpriteId } from "world/sprite/Sprite";
import { Refresh } from "./Refresh";
import { GraphicsEngine } from "core/GraphicsEngine";

export class SpriteTransformUpdate implements Refresh {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private getSprite: (spriteId: SpriteId) => Sprite | undefined, private engine: GraphicsEngine) {
  }

  withSpriteId(spriteId: SpriteId): SpriteTransformUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  refresh(): void {
    this.engine.updateSpriteTransforms(this.updatedSpriteIds, this.getSprite);
  }
}
