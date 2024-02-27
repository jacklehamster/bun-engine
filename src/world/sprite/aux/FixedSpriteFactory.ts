import { Sprite } from "../Sprite";
import { IElemFactory } from "./IElemFactory";
import { PositionUtils } from "dok-matrix";
import { List, forEach } from "abstract-list";
import { Cell, Tag } from "cell-tracker";
import { copySprite } from "../utils/sprite-utils";
import { Auxiliary } from "world/aux/Auxiliary";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { Vector } from "dok-types";
import { cellTag } from "cell-tracker";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

export class FixedSpriteFactory extends AuxiliaryHolder implements IElemFactory<Sprite>, Auxiliary {
  private readonly spritesPerCell: Map<Tag, Sprite[]> = new Map();
  private readonly spritesList: List<Sprite>[];
  readonly #tempVector: Vector = [0, 0, 0];
  private readonly config: Config;

  constructor(config: Config, ...spritesList: (List<Sprite> & Partial<Auxiliary>)[]) {
    super();
    this.spritesList = spritesList;
    this.config = config;
    spritesList.forEach(sprites => this.addAuxiliary(sprites));
  }

  activate(): void {
    super.activate();
    this.spritesList.forEach(sprites => {
      forEach(sprites, sprite => {
        if (sprite) {
          PositionUtils.transformToPosition(sprite.transform, this.#tempVector);
          const tag = cellTag(this.#tempVector[0], this.#tempVector[1], this.#tempVector[2], this.config.cellSize ?? 1);
          if (!this.spritesPerCell.has(tag)) {
            this.spritesPerCell.set(tag, []);
          }
          this.spritesPerCell.get(tag)?.push(copySprite(sprite));
        }
      });
    });
  }

  getElemsAtCell(cell: Cell): List<Sprite> | undefined {
    return this.spritesPerCell.get(cell.tag);
  }
}
