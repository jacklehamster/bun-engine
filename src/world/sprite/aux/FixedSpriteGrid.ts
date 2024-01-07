import { SpriteGrid } from "./SpriteGrid";
import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { forEach } from "../List";
import { transformToPosition } from "world/grid/Position";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { cellTag } from "world/grid/CellPos";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

const EMPTY: Sprite[] = [];

export class FixedSpriteGrid extends SpriteGrid {
  private cellSize: number;
  private spritesPerCell: Record<string, Sprite[]> = {};

  constructor(config: Config, private sprites: Sprites) {
    super({ spriteLimit: config.spriteLimit ?? sprites.length }, cell => {
      return this.spritesPerCell[cell.tag] ?? EMPTY
    });
    this.cellSize = config.cellSize ?? 1;
  }

  activate(): void | (() => void) {
    forEach(this.sprites, (sprite) => {
      if (sprite) {
        const pos = transformToPosition(sprite.transform);
        const cellPos = PositionMatrix.getCellPos(pos, this.cellSize);
        const tag = cellTag(...cellPos);
        this.spritesPerCell[tag] = this.spritesPerCell[tag] ?? [];
        this.spritesPerCell[tag].push(sprite);
      }
    });
  }
}
