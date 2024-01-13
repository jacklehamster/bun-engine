import { Auxiliary } from "world/aux/Auxiliary";
import { PositionMatrix } from "../PositionMatrix";
import { Cell, cellTag } from "world/grid/CellPos";
import { VisitCell } from "../../../world/grid/VisitCell";
import { UpdatePayload } from "updates/Refresh";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";

interface Config {
  cellSize?: number;
}

export class CellChangeAuxiliary extends AuxiliaryHolder implements Auxiliary<PositionMatrix> {
  private matrix?: PositionMatrix;
  private cellSize: number;
  private cell: Cell;
  visitCell?: VisitCell;

  constructor(config?: Config) {
    super();
    this.cellSize = config?.cellSize ?? 1;
    this.cell = { pos: [0, 0, 0, this.cellSize], tag: "" };
  }

  set holder(value: PositionMatrix | undefined) {
    this.matrix = value;
    if (this.matrix) {
      const cellPos = this.matrix.getCellPosition(this.cellSize);
      this.cell.pos[0] = cellPos[0];
      this.cell.pos[1] = cellPos[1];
      this.cell.pos[2] = cellPos[2];
      this.cell.tag = cellTag(...this.cell.pos);
    }
  }

  activate(): void {
    this.visitCell?.visitCell(this.cell);
  }

  refresh(updatePayload: UpdatePayload): void {
    if (!this.matrix) {
      return;
    }
    const [x, y, z] = this.matrix.getCellPosition(this.cellSize);
    if (this.cell.pos[0] !== x || this.cell.pos[1] !== y || this.cell.pos[2] !== z) {
      this.cell.pos[0] = x;
      this.cell.pos[1] = y;
      this.cell.pos[2] = z;
      this.cell.tag = cellTag(...this.cell.pos);
      this.visitCell?.visitCell(this.cell, updatePayload);
    }
  }
}
