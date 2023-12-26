import { Sprite, SpriteId } from "world/sprite/Sprite";
import { Refresh } from "./Refresh";
import { GraphicsEngine } from "core/GraphicsEngine";
import { UpdateNotifier } from "./UpdateNotifier";
import { Motor } from "core/Motor";

export class SpriteTransformUpdate implements Refresh, UpdateNotifier {
  private readonly updatedSpriteIds: Set<SpriteId> = new Set();
  constructor(private getSprite: (spriteId: SpriteId) => Sprite | undefined, private engine: GraphicsEngine, private motor: Motor) {
  }

  informUpdate(id: SpriteId): void {
    this.motor.registerUpdate(this.withSpriteId(id));
  }

  withSpriteId(spriteId: SpriteId): SpriteTransformUpdate {
    this.updatedSpriteIds.add(spriteId);
    return this;
  }

  refresh(): void {
    this.engine.updateSpriteTransforms(this.updatedSpriteIds, this.getSprite);
  }
}
