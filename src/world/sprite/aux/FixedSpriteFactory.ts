import { CellUtils } from "utils/cell-utils";
import { Sprite } from "../Sprite";
import { IElemFactory } from "./IElemFactory";
import { PositionUtils } from "dok-matrix";
import { List, forEach } from "abstract-list";
import { Cell, Tag } from "cell-tracker";
import { copySprite } from "../utils/sprite-utils";
import { Auxiliary } from "world/aux/Auxiliary";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { Vector } from "dok-types";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

interface Props {
  cellUtils: CellUtils;
}

export class FixedSpriteFactory extends AuxiliaryHolder implements IElemFactory<Sprite>, Auxiliary {
  private readonly spritesPerCell: Map<Tag, Sprite[]> = new Map();
  private readonly spritesList: List<Sprite>[];
  private readonly cellUtils: CellUtils;
  readonly #tempVector: Vector = [0, 0, 0];
  private readonly config: Config;

  constructor({ cellUtils }: Props, config: Config, ...spritesList: (List<Sprite> & Partial<Auxiliary>)[]) {
    super();
    this.spritesList = spritesList;
    this.cellUtils = cellUtils;
    this.config = config;
    spritesList.forEach(sprites => this.addAuxiliary(sprites));
  }

  activate(): void {
    super.activate();
    this.spritesList.forEach(sprites => {
      forEach(sprites, sprite => {
        if (sprite) {
          PositionUtils.transformToPosition(sprite.transform, this.#tempVector);
          const cell = this.cellUtils.cellFromPos(this.#tempVector, this.config.cellSize ?? 1);
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
