import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { Sprite, SpriteId } from "./Sprite";
import { IMotor } from "core/motor/IMotor";
import { forEach } from "./List";
import { Sprites } from "./Sprites";
import { SpriteUpdater } from "./update/SpriteUpdater";
import { UpdatePayload } from "updates/Refresh";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

interface Slot {
  sprites: Sprites;
  baseIndex: number;
}

export class SpritesAccumulator extends SpriteUpdater {
  private readonly spritesIndices: Slot[] = [];

  constructor({ engine, motor }: Props) {
    super({ engine, motor });
  }

  at(spriteId: SpriteId): Sprite | undefined {
    const slot = this.spritesIndices[spriteId];
    return slot?.sprites.at(spriteId - slot.baseIndex);
  }

  get length(): number {
    return this.spritesIndices.length;
  }

  add(sprites: Sprites): void {
    const slot = {
      sprites,
      baseIndex: this.spritesIndices.length,
    };
    if (sprites.informUpdate) {
      //  overwrite
      sprites.informUpdate = (index, type) => {
        this.informUpdate(slot.baseIndex + index, type);
      };
    }
    forEach(sprites, (_, index) => {
      this.spritesIndices.push(slot);
      this.informUpdate(slot.baseIndex + index);
    });
  }

  onUpdate(updatePayload: UpdatePayload): void {
  }
}
