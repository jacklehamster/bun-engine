import { Auxiliary } from "world/aux/Auxiliary";
import { PositionMatrix } from "../PositionMatrix";
import { Cell, cellTag } from "world/grid/CellPos";
import { VisitCell } from "../../../world/grid/VisitCell";
import { UpdatePayload } from "updates/Refresh";
import { RefreshOrder } from "updates/RefreshOrder";

interface Props {
  matrix: PositionMatrix;
  visitCell: VisitCell;
}

interface Config {
  cellSize?: number;
}

export class CellChangeAuxiliary implements Auxiliary {
  private matrix: PositionMatrix;
  private cellSize: number;
  private cell: Cell;
  private visitCellObj: VisitCell;
  readonly refreshOrder = RefreshOrder.FIRST;

  constructor({ matrix, visitCell }: Props, config?: Config) {
    this.matrix = matrix;
    this.cellSize = config?.cellSize ?? 1;
    this.visitCellObj = visitCell;
    this.cell = { pos: [0, 0, 0, this.cellSize], tag: "" };
    const cellPos = matrix.getCellPosition(this.cellSize);
    this.cell.pos[0] = cellPos[0];
    this.cell.pos[1] = cellPos[1];
    this.cell.pos[2] = cellPos[2];
    this.cell.tag = cellTag(...this.cell.pos);
  }

  activate(): void | (() => void) {
    this.visitCellObj.visitCell(this.cell);
  }

  refresh(updatePayload: UpdatePayload): void {
    const [x, y, z] = this.matrix.getCellPosition(this.cellSize);
    if (this.cell.pos[0] !== x || this.cell.pos[1] !== y || this.cell.pos[2] !== z) {
      this.cell.pos[0] = x;
      this.cell.pos[1] = y;
      this.cell.pos[2] = z;
      this.cell.tag = cellTag(...this.cell.pos);
      this.visitCellObj.visitCell(this.cell, updatePayload);
    }
  }
}
