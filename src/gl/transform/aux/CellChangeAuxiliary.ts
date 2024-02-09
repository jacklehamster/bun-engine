import { Auxiliary } from "world/aux/Auxiliary";
import { CellUtils } from "world/grid/utils/cell-utils";
import { IVisitableCell, Cell } from "cell-tracker";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ChangeListener, IPositionMatrix } from "../IPositionMatrix";

interface Config {
  cellSize?: number;
}

interface Props {
  cellUtils: CellUtils;
  visitableCell: IVisitableCell;
  positionMatrix: IPositionMatrix;
}

export class CellChangeAuxiliary extends AuxiliaryHolder implements Auxiliary {
  private readonly positionMatrix: IPositionMatrix;
  private readonly visitableCell?: IVisitableCell;
  private readonly cellUtils: CellUtils;
  private readonly cellSize: number;
  private readonly previousCellPos: Cell["pos"];
  private readonly listener: ChangeListener = () => this.checkPosition();

  constructor({ cellUtils, visitableCell, positionMatrix }: Props, config?: Config) {
    super();
    this.visitableCell = visitableCell;
    this.cellUtils = cellUtils;
    this.cellSize = config?.cellSize ?? 1;
    this.previousCellPos = [Number.NaN, Number.NaN, Number.NaN, this.cellSize];
    this.positionMatrix = positionMatrix;
  }

  checkPosition(): void {
    if (!this.positionMatrix || !this.visitableCell) {
      return;
    }
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
    super.activate();
    this.positionMatrix.onChange(this.listener);
    this.previousCellPos[0] = Number.NaN;
    this.previousCellPos[1] = Number.NaN;
    this.previousCellPos[2] = Number.NaN;
    this.checkPosition();
  }

  deactivate(): void {
    this.positionMatrix.removeChangeListener(this.listener);
    super.deactivate();
  }
}
