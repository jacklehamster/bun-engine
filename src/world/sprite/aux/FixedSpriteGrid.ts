import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { copySprite } from "../utils/sprite-utils";
import { forEach } from "../../../core/List";
import { PositionUtils } from "world/grid/utils/position-utils";
import { CellUtils } from "world/grid/utils/cell-utils";
import { Auxiliary } from "world/aux/Auxiliary";
import { Tag } from "world/grid/Cell";
import { Grid } from "./Grid";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

interface Props {
  cellUtils: CellUtils;
  positionUtils: PositionUtils;
}

export class FixedSpriteGrid extends Grid<Sprite> {
  private readonly cellSize: number;
  private readonly spritesPerCell: Map<Tag, Sprite[]> = new Map();
  private readonly spritesList: Sprites[];
  private readonly cellUtils: CellUtils;
  private readonly positionUtils: PositionUtils;

  constructor({ cellUtils, positionUtils }: Props, config: Config, ...spritesList: ((Sprites | Sprite[]) & Partial<Auxiliary>)[]) {
    super(copySprite, {}, {
      getElemsAtCell: cell => this.spritesPerCell.get(cell.tag),
    });
    this.positionUtils = positionUtils;
    this.cellUtils = cellUtils;
    this.cellSize = config.cellSize ?? 1;
    this.spritesList = spritesList;
    spritesList.forEach(sprites => this.addAuxiliary(sprites));
  }

  activate(): void {
    super.activate();
    this.spritesList.forEach(sprites => {
      forEach(sprites, (sprite) => {
        if (sprite) {
          const pos = this.positionUtils.transformToPosition(sprite.transform);
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
