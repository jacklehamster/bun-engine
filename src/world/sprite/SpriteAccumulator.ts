import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { Sprite, SpriteId } from "./Sprite";
import { Sprites } from "./Sprites";
import { IMotor } from "core/motor/IMotor";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { UpdateNotifier } from "updates/UpdateNotifier";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

enum SpriteUpdateType {
  NONE = 0,
  TRANSFORM = 1,
  ANIM = 2,
  ALL = 3,
};

export class SpritesAccumulator implements Sprites, UpdateNotifier {
  private spritesList: Sprites[] = [];
  private spritesIndices: { sprites: Sprites, baseIndex: number }[] = [];
  private spriteTransformUpdate: SpriteTransformUpdate;
  private spriteAnimUpdate: SpriteAnimUpdate;

  constructor({ engine, motor }: Props) {
    this.spriteTransformUpdate = new SpriteTransformUpdate(this.at.bind(this), engine, motor);
    this.spriteAnimUpdate = new SpriteAnimUpdate(this.at.bind(this), engine, motor);
  }

  informUpdate(id: SpriteId, type: SpriteUpdateType = SpriteUpdateType.ALL): void {
    if (type & SpriteUpdateType.TRANSFORM) {
      this.spriteTransformUpdate.informUpdate(id);
    }
    if (type & SpriteUpdateType.ANIM) {
      this.spriteAnimUpdate.informUpdate(id);
    }
  }

  at(index: SpriteId): Sprite | undefined {
    const spritesIndex = this.spritesIndices[index];
    return spritesIndex?.sprites.at(index - (spritesIndex?.baseIndex ?? 0));
  }

  get length(): number {
    return this.spritesIndices.length;
  }

  add(sprites: Sprites): void {
    if (this.spritesList.indexOf(sprites) >= 0) {
      return;
    }
    this.spritesList.push(sprites);
    const baseIndex = this.spritesIndices.length;
    for (let i = 0; i < sprites.length; i++) {
      this.informUpdate(baseIndex + i);
      this.spritesIndices.push({
        sprites,
        baseIndex,
      });
    }
  }
}
