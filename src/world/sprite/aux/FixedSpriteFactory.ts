import { CellUtils } from "world/grid/utils/cell-utils";
import { Sprite } from "../Sprite";
import { IElemFactory } from "./IElemFactory";
import { PositionUtils } from "world/grid/utils/position-utils";
import { List, forEach } from "abstract-list";
import { Cell, Tag } from "world/grid/Cell";
import { Sprites } from "../Sprites";
import { copySprite } from "../utils/sprite-utils";
import { Auxiliary } from "world/aux/Auxiliary";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ElemsHolder } from "./ElemsHolder";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

interface Props {
  cellUtils: CellUtils;
  positionUtils: PositionUtils;
}

export class FixedSpriteFactory extends AuxiliaryHolder<ElemsHolder<Sprite>> implements IElemFactory<Sprite>, Auxiliary {
  private readonly spritesPerCell: Map<Tag, Sprite[]> = new Map();
  private readonly spritesList: Sprites[];
  private readonly cellUtils: CellUtils;
  private readonly positionUtils: PositionUtils;
  private readonly config: Config;

  constructor({ cellUtils, positionUtils }: Props, config: Config, ...spritesList: ((Sprites | Sprite[]) & Partial<Auxiliary>)[]) {
    super();
    this.spritesList = spritesList;
    this.cellUtils = cellUtils;
    this.positionUtils = positionUtils;
    this.config = config;
    spritesList.forEach(sprites => this.addAuxiliary(sprites));
  }

  activate(): void {
    super.activate();
    this.spritesList.forEach(sprites => {
      forEach(sprites, sprite => {
        if (sprite) {
          const pos = this.positionUtils.transformToPosition(sprite.transform);
          const cell = this.cellUtils.cellFromPos(pos, this.config.cellSize ?? 1);
          if (!this.spritesPerCell.has(cell.tag)) {
            this.spritesPerCell.set(cell.tag, []);
          }
          this.spritesPerCell.get(cell.tag)?.push(copySprite(sprite));
        }
      });
    });
  }

  getElemsAtCell(cell: Cell): List<Sprite> | undefined {
    return this.spritesPerCell.get(cell.tag);
  }
}
