import { Auxiliary } from "world/aux/Auxiliary";
import { CellUtils } from "world/grid/utils/cell-utils";
import { VisitableCell } from "../../../world/grid/VisitCell";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ChangeListener, IPositionMatrix } from "../IPositionMatrix";
import { CellPos } from "world/grid/CellPos";

interface Config {
  cellSize?: number;
}

export class CellChangeAuxiliary extends AuxiliaryHolder implements Auxiliary<IPositionMatrix> {
  visitableCell?: VisitableCell;
  private positionMatrix?: IPositionMatrix;
  private readonly cellSize: number;
  private readonly previousCellPos: CellPos;
  private readonly listener: ChangeListener = () => this.checkPosition();

  constructor(private cellUtils: CellUtils, config?: Config) {
    super();
    this.cellSize = config?.cellSize ?? 1;
    this.previousCellPos = [Number.NaN, Number.NaN, Number.NaN, this.cellSize];
  }

  set holder(value: IPositionMatrix) {
    this.positionMatrix = value;
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
    this.positionMatrix?.onChange(this.listener);
    this.previousCellPos[0] = Number.NaN;
    this.previousCellPos[1] = Number.NaN;
    this.previousCellPos[2] = Number.NaN;
    this.checkPosition();
  }

  deactivate(): void {
    this.positionMatrix?.removeChangeListener(this.listener);
    super.deactivate();
  }
}
