import { Sprite, SpriteId } from "world/Sprite";
import { Update } from "./Update";
import { GraphicsEngine } from "core/GraphicsEngine";

export class SpriteTransformUpdate implements Update {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private getSprite: (spriteId: SpriteId) => Sprite | undefined, private engine: GraphicsEngine) {
  }

  withSpriteId(spriteId: SpriteId): SpriteTransformUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  update(): void {
    this.engine.updateSpriteTransforms(this.updatedSpriteIds, this.getSprite);
  }
}
