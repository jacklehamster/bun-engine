import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { copySprite } from "../utils/sprite-utils";
import { forEach } from "../List";
import { transformToPosition } from "world/grid/utils/position-utils";
import { CellUtils } from "world/grid/utils/cell-utils";
import { Auxiliary } from "world/aux/Auxiliary";
import { Tag } from "world/grid/Cell";
import { Grid } from "./Grid";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

export class FixedSpriteGrid extends Grid<Sprite> {
  private readonly cellSize: number;
  private readonly spritesPerCell: Map<Tag, Sprite[]> = new Map();
  private readonly spritesList: Sprites[];

  constructor(private cellUtils: CellUtils, config: Config, ...spritesList: ((Sprites | Sprite[]) & Partial<Auxiliary>)[]) {
    super(copySprite, {}, {
      getElemsAtCell: cell => this.spritesPerCell.get(cell.tag),
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
          if (!this.spritesPerCell.has(cell.tag)) {
            this.spritesPerCell.set(cell.tag, []);
          }
          this.spritesPerCell.get(cell.tag)?.push(copySprite(sprite));
        }
      });
    });
  }

  deactivate(): void {
    for (let tag in this.spritesPerCell) {
      this.spritesPerCell.delete(tag);
    }
    super.deactivate();
  }
}
