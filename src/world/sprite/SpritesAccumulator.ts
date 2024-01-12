import { Sprite, SpriteId } from "./Sprite";
import { forEach } from "./List";
import { Sprites } from "./Sprites";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { SpritesHolder } from "./aux/SpritesHolder";
import { ObjectPool } from "utils/ObjectPool";

interface Slot {
  sprites: Sprites;
  index: number;
  spriteId: SpriteId;
}

export class SpritesAccumulator extends AuxiliaryHolder implements SpritesHolder {
  private readonly spritesIndices: Slot[] = [];
  private readonly newSpritesListener: Set<(accumulator: SpritesHolder) => void> = new Set();
  private readonly pool: ObjectPool<Slot, [Sprites, SpriteId, number]> = new ObjectPool<Slot, [Sprites, SpriteId, number]>((elem, sprites, spriteId, index) => {
    if (!elem) {
      return { sprites, spriteId, index };
    }
    elem.sprites = sprites;
    elem.spriteId = spriteId;
    elem.index = index;
    return elem;
  });

  informUpdate?(id: number, type?: number): void;

  addNewSpritesListener(listener: (holder: SpritesHolder) => void): void {
    this.newSpritesListener.add(listener);
  }

  at(spriteId: SpriteId): Sprite | undefined {
    const slot = this.spritesIndices[spriteId];
    return slot?.sprites.at(slot.index);
  }

  get length(): number {
    return this.spritesIndices.length;
  }

  addSprites(...spritesList: Sprites[]): void {
    spritesList.forEach(sprites => {
      const slots: Slot[] = [];
      if (sprites.informUpdate) {
        //  overwrite
        sprites.informUpdate = (index, type) => {
          const slot = slots[index];
          this.informUpdate?.(slot.spriteId, type);
        };
      }
      forEach(sprites, (_, index) => {
        const slot = this.pool.create(sprites, this.spritesIndices.length, index);
        slots.push(slot);
        this.spritesIndices.push(slot);
        this.informUpdate?.(slot.spriteId);
      });
    });
    this.newSpritesListener.forEach(listener => listener(this));
  }

  deactivate(): void {
    super.deactivate();
    this.spritesIndices.forEach(slot => {
      this.pool.recycle(slot);
    });
    this.spritesIndices.length = 0;
  }
}
