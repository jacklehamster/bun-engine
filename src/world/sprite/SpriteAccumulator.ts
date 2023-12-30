import { Sprite } from "./Sprite";
import { Sprites } from "./Sprites";

export class SpritesAccumulator implements Sprites {
  private spritesList: Sprites[] = [];
  private spritesIndices: { sprites: Sprites, baseIndex: number }[] = [];

  at(index: number): Sprite | undefined {
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
      this.spritesIndices.push({
        sprites,
        baseIndex,
      });
    }
  }
}
