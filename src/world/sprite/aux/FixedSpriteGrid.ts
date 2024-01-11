import { SpriteGrid } from "./SpriteGrid";
import { Sprites } from "../Sprites";
import { Sprite, copySprite } from "../Sprite";
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
  private readonly spritesList: Sprites[];

  constructor(config: Config, ...spritesList: Sprites[]) {
    super({ spriteLimit: config.spriteLimit ?? spritesList.reduce((a, s) => a + s.length, 0) }, {
      getSpritesAtCell: cell => {
        return this.spritesPerCell[cell.tag] ?? EMPTY
      }
    });
    this.cellSize = config.cellSize ?? 1;
    this.spritesList = spritesList;
  }

  activate(): void {
    super.activate();
    this.spritesList.forEach(sprites => {
      forEach(sprites, (sprite) => {
        if (sprite) {
          const pos = transformToPosition(sprite.transform);
          const cellPos = PositionMatrix.getCellPos(pos, this.cellSize);
          const tag = cellTag(...cellPos);
          this.spritesPerCell[tag] = this.spritesPerCell[tag] ?? [];
          this.spritesPerCell[tag].push(copySprite(sprite));
        }
      });
    });
  }
}
