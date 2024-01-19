import { SpriteGrid } from "./SpriteGrid";
import { Sprites } from "../Sprites";
import { Sprite, copySprite } from "../Sprite";
import { forEach } from "../List";
import { transformToPosition } from "world/grid/Position";
import { cellTag, getCellPos } from "world/grid/CellPos";
import { Auxiliary } from "world/aux/Auxiliary";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

const EMPTY: Sprite[] = [];

export class FixedSpriteGrid extends SpriteGrid {
  private cellSize: number;
  private readonly spritesPerCell: Map<string, Sprite[]> = new Map();
  private readonly spritesList: Sprites[];

  constructor(config: Config, ...spritesList: ((Sprites | Sprite[]) & Partial<Auxiliary>)[]) {
    super({}, {
      getElemsAtCell: cell => this.spritesPerCell.get(cell.tag) ?? EMPTY,
    });
    this.cellSize = config.cellSize ?? 1;
    this.spritesList = spritesList;
    spritesList.forEach(sprites => this.addAuxiliary(sprites));
  }

  activate(): void {
    super.activate();
    this.spritesList.forEach(sprites => {
      forEach(sprites, (sprite) => {
        if (sprite) {
          const pos = transformToPosition(sprite.transform);
          const cellPos = getCellPos(pos, this.cellSize);
          const tag = cellTag(...cellPos);
          if (!this.spritesPerCell.has(tag)) {
            this.spritesPerCell.set(tag, []);
          }
          this.spritesPerCell.get(tag)?.push(copySprite(sprite));
        }
      });
    });
  }

  deactivate(): void {
    this.spritesPerCell.clear();
    super.deactivate();
  }
}
