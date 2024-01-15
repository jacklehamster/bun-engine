import { Sprite, SpriteId } from "./Sprite";
import { Sprites } from "./Sprites";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { SpritesHolder } from "./aux/SpritesHolder";
import { ObjectPool } from "utils/ObjectPool";
import { forEach } from "./List";

interface Slot {
  sprites: Sprites;
  index: number;
  spriteId?: SpriteId;
}

export class SpritesAccumulator extends AuxiliaryHolder implements SpritesHolder {
  private readonly spritesIndices: Slot[] = [];
  private readonly newSpritesListener: Set<(accumulator: SpritesHolder) => void> = new Set();
  private readonly pool: ObjectPool<Slot, [Sprites, number]> = new ObjectPool<Slot, [Sprites, number]>((elem, sprites, index) => {
    if (!elem) {
      return { sprites, index };
    }
    elem.sprites = sprites;
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

  activate(): void {
    super.activate();
    this.spritesIndices.forEach(slot => {
      if (slot.spriteId !== undefined) {
        this.informUpdate?.(slot.spriteId);
      }
    });
  }

  addSprites(...spritesList: Sprites[]): void {
    spritesList.forEach(sprites => {
      const slots: Slot[] = [];
      if (sprites.informUpdate) {
        //  overwrite if it's defined to informUpdate through SpriteAccumulator.
        sprites.informUpdate = (index, type) => {
          const slot = slots[index] ?? (slots[index] = this.pool.create(sprites, index));
          const sprite = slot.sprites.at(index);
          if (sprite) {
            if (slot.spriteId === undefined) {
              slot.spriteId = this.spritesIndices.length;
              this.spritesIndices.push(slot);
              this.onSizeChange();
            }
            this.informUpdate?.(slot.spriteId, type);
          } else {
            if (slot.spriteId !== undefined) {
              const spriteId = slot.spriteId;
              slot.spriteId = undefined;
              const lastSlotId = this.spritesIndices.length - 1;
              if (spriteId !== lastSlotId) {
                this.spritesIndices[spriteId] = this.spritesIndices[lastSlotId];
                this.spritesIndices[spriteId].spriteId = spriteId;
              }
              this.spritesIndices.pop();
              this.informUpdate?.(spriteId);
              this.informUpdate?.(lastSlotId);
              this.onSizeChange();
            }
          }
        };
      } else {
        forEach(sprites, (_, index) => {
          const slot = this.pool.create(sprites, index);
          slot.spriteId = this.spritesIndices.length;
          this.spritesIndices.push(slot);
        });
      }
    });
  }

  onSizeChange() {
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
