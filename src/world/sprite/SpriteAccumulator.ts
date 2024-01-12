import { Sprite, SpriteId } from "./Sprite";
import { forEach } from "./List";
import { Sprites } from "./Sprites";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { SpritesHolder } from "./aux/SpritesHolder";
import IWorld from "world/IWorld";

interface Slot {
  sprites: Sprites;
  baseIndex: number;
}

export class SpritesAccumulator extends AuxiliaryHolder<IWorld> implements SpritesHolder {
  private readonly spritesIndices: Slot[] = [];

  set holder(world: IWorld) {
    world.sprites = this;
  }

  informUpdate?(id: number, type?: number): void;

  at(spriteId: SpriteId): Sprite | undefined {
    const slot = this.spritesIndices[spriteId];
    return slot?.sprites.at(spriteId - slot.baseIndex);
  }

  get length(): number {
    return this.spritesIndices.length;
  }

  addSprites(...spritesList: Sprites[]): void {
    spritesList.forEach(sprites => {
      const slot = { sprites, baseIndex: this.spritesIndices.length };
      if (sprites.informUpdate) {
        //  overwrite
        sprites.informUpdate = (index, type) => {
          this.informUpdate?.(slot.baseIndex + index, type);
        };
      }
      forEach(sprites, (_, index) => {
        this.spritesIndices.push(slot);
        this.informUpdate?.(slot.baseIndex + index);
      });
    })
  }
}
