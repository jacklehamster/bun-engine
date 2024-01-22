import { SpriteGrid } from "./SpriteGrid";
import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { copySprite } from "../utils/sprite-utils";
import { forEach } from "../List";
import { transformToPosition } from "world/grid/utils/position-utils";
import { CellUtils } from "world/grid/utils/cell-utils";
import { Auxiliary } from "world/aux/Auxiliary";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

export class FixedSpriteGrid extends SpriteGrid {
  private readonly cellSize: number;
  private readonly spritesPerCell: Record<string, Sprite[]> = {};
  private readonly spritesList: Sprites[];

  constructor(private cellUtils: CellUtils, config: Config, ...spritesList: ((Sprites | Sprite[]) & Partial<Auxiliary>)[]) {
    super({}, {
      getElemsAtCell: cell => this.spritesPerCell[cell.tag],
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
          const cell = this.cellUtils.cellFromPos(pos, this.cellSize);
          if (!this.spritesPerCell[cell.tag]) {
            this.spritesPerCell[cell.tag] = [];
          }
          this.spritesPerCell[cell.tag]?.push(copySprite(sprite));
        }
      });
    });
  }

  deactivate(): void {
    for (let tag in this.spritesPerCell) {
      delete this.spritesPerCell[tag];
    }
    super.deactivate();
  }
}
