import { CellUtils } from "utils/cell-utils";
import { IVisitableCell, Cell } from "cell-tracker";
import { IMatrix, IPositionMatrix } from "dok-matrix";
import { Active } from "dok-types";
import { IChangeListener } from "change-listener";

interface Config {
  cellSize?: number;
}

interface Props {
  cellUtils: CellUtils;
  visitableCells: IVisitableCell[];
  positionMatrix: IPositionMatrix;
}

export class CellChangeDectector implements Active {
  private readonly positionMatrix: IPositionMatrix;
  private readonly visitableCells: IVisitableCell[];
  private readonly cellUtils: CellUtils;
  private readonly cellSize: number;
  private readonly previousCellPos: Cell["pos"];
  private readonly listener: IChangeListener<IMatrix> = {
    onChange: () => this.#checkPosition(this.positionMatrix),
  };

  constructor({ cellUtils, visitableCells, positionMatrix }: Props, config?: Config) {
    this.visitableCells = visitableCells;
    this.cellUtils = cellUtils;
    this.cellSize = config?.cellSize ?? 1;
    this.previousCellPos = [Number.NaN, Number.NaN, Number.NaN, this.cellSize];
    this.positionMatrix = positionMatrix;
  }

  #checkPosition(posMatrix: IPositionMatrix): void {
    const pos = posMatrix.position;
    const cell = this.cellUtils.cellFromPos(pos, this.previousCellPos[3]);
    if (this.previousCellPos[0] !== cell.pos[0] || this.previousCellPos[1] !== cell.pos[1] || this.previousCellPos[2] !== cell.pos[2]) {
      this.previousCellPos[0] = cell.pos[0];
      this.previousCellPos[1] = cell.pos[1];
      this.previousCellPos[2] = cell.pos[2];
      for (const visitableCell of this.visitableCells) {
        visitableCell.visitCell(cell);
      }
    }
  }

  activate(): void {
    this.positionMatrix.addChangeListener(this.listener);
    this.previousCellPos[0] = Number.NaN;
    this.previousCellPos[1] = Number.NaN;
    this.previousCellPos[2] = Number.NaN;
    this.#checkPosition(this.positionMatrix);
  }

  deactivate(): void {
    this.positionMatrix.removeChangeListener(this.listener);
  }
}
