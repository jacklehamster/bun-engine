import { Sprite } from "../Sprite";
import { IElemFactory } from "./IElemFactory";
import { List, forEach } from "abstract-list";
import { Cell, Tag, createCell, toCell } from "cell-tracker";
import { copySprite } from "../utils/sprite-utils";
import { Auxiliary } from "world/aux/Auxiliary";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { Vector } from "dok-types";
import { transformToPosition } from "dok-matrix";

interface Config {
  cellSize?: number;
  spriteLimit?: number;
}

export class FixedSpriteFactory extends AuxiliaryHolder implements IElemFactory<Sprite>, Auxiliary {
  private readonly spritesPerCell: Map<Tag, Sprite[]> = new Map();
  private readonly spritesList: List<Sprite>[];
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
          const vector: Vector = [0, 0, 0];
          transformToPosition(sprite.transform, vector);
          const cellSize = this.config.cellSize ?? 1;

          const cell = createCell(
            toCell(vector[0], cellSize),
            toCell(vector[1], cellSize),
            toCell(vector[2], cellSize),
            cellSize);
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
