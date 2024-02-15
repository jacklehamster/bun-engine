import { CellUtils } from "utils/cell-utils";
import { IVisitableCell, Cell } from "cell-tracker";
import { ChangeListener, IPositionMatrix } from "dok-matrix";
import { Active } from "dok-types";

interface Config {
  cellSize?: number;
}

interface Props {
  cellUtils: CellUtils;
  visitableCell: IVisitableCell;
  positionMatrix: IPositionMatrix;
}

export class CellChangeDectector implements Active {
  private readonly positionMatrix: IPositionMatrix;
  private readonly visitableCell: IVisitableCell;
  private readonly cellUtils: CellUtils;
  private readonly cellSize: number;
  private readonly previousCellPos: Cell["pos"];
  private readonly listener: ChangeListener = () => this.checkPosition();

  constructor({ cellUtils, visitableCell, positionMatrix }: Props, config?: Config) {
    this.visitableCell = visitableCell;
    this.cellUtils = cellUtils;
    this.cellSize = config?.cellSize ?? 1;
    this.previousCellPos = [Number.NaN, Number.NaN, Number.NaN, this.cellSize];
    this.positionMatrix = positionMatrix;
  }

  checkPosition(): void {
    const pos = this.positionMatrix.position;
    const cell = this.cellUtils.cellFromPos(pos, this.previousCellPos[3]);
    if (this.previousCellPos[0] !== cell.pos[0] || this.previousCellPos[1] !== cell.pos[1] || this.previousCellPos[2] !== cell.pos[2]) {
      this.previousCellPos[0] = cell.pos[0];
      this.previousCellPos[1] = cell.pos[1];
      this.previousCellPos[2] = cell.pos[2];
      this.visitableCell.visitCell(cell);
    }
  }

  activate(): void {
    this.positionMatrix.onChange(this.listener);
    this.previousCellPos[0] = Number.NaN;
    this.previousCellPos[1] = Number.NaN;
    this.previousCellPos[2] = Number.NaN;
    this.checkPosition();
  }

  deactivate(): void {
    this.positionMatrix.removeChangeListener(this.listener);
  }
}