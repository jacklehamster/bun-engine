import { SpriteGrid } from "./SpriteGrid";
import { Sprites } from "../Sprites";
import { Sprite, copySprite } from "../Sprite";
import { forEach } from "../List";
import { transformToPosition } from "world/grid/Position";
import { cellTag, getCellPos } from "world/grid/CellPos";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

const EMPTY: Sprite[] = [];

export class FixedSpriteGrid extends SpriteGrid {
  private cellSize: number;
  private readonly spritesPerCell: Record<string, Sprite[]> = {};
  private readonly spritesList: Sprites[];

  constructor(config: Config, ...spritesList: (Sprites | Sprite[])[]) {
    super({}, {
      getSpritesAtCell: cell => this.spritesPerCell[cell.tag] ?? EMPTY,
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
          const cellPos = getCellPos(pos, this.cellSize);
          const tag = cellTag(...cellPos);
          this.spritesPerCell[tag] = this.spritesPerCell[tag] ?? [];
          this.spritesPerCell[tag].push(copySprite(sprite));
        }
      });
    });
  }
}
