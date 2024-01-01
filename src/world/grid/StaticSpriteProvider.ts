import { List, forEach } from "world/sprite/List";
import { Sprite, SpriteId } from "world/sprite/Sprite";
import { Cell, cellTag } from "./CellPos";
import { SpriteProvider } from "./SpriteProvider";
import { transformToPosition } from "./Position";

export class StaticSpriteProvider implements SpriteProvider {
  private spriteMap: Record<string, List<SpriteId>> = {};

  constructor(private sprites: List<Sprite>) {
    const tagToIds: Record<string, Set<SpriteId>> = {};
    forEach(this.sprites, (sprite, id) => {
      const pos = transformToPosition(sprite.transform);
      const tag = cellTag(...pos);
      if (!tagToIds[tag]) {
        tagToIds[tag] = new Set();
      }
      tagToIds[tag].add(id);
    });
    Object.entries(tagToIds).forEach(([tag, ids]) => {
      this.spriteMap[tag] = Array.from(ids).sort((a, b) => a - b);
    });
  }

  getUpdatedSprites(cell: Cell): List<SpriteId> {
    return this.spriteMap[cell.tag];
  }

  get length() {
    return this.sprites.length;
  }

  at(index: number): Sprite | undefined {
    return this.sprites.at(index);
  }
}
