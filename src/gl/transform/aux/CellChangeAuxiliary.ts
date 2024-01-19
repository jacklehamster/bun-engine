import { Auxiliary } from "world/aux/Auxiliary";
import { Cell, cellTag, getCellPos } from "world/grid/CellPos";
import { VisitableCell } from "../../../world/grid/VisitCell";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ChangeListener, IPositionMatrix } from "../IPositionMatrix";

interface Config {
  cellSize?: number;
}

export class CellChangeAuxiliary extends AuxiliaryHolder implements Auxiliary<IPositionMatrix> {
  private positionMatrix?: IPositionMatrix;
  private readonly cellSize: number;
  private readonly cell: Cell;
  visitableCell?: VisitableCell;
  private readonly listener: ChangeListener = () => this.checkPosition();

  constructor(config?: Config) {
    super();
    this.cellSize = config?.cellSize ?? 1;
    this.cell = { pos: [Number.NaN, Number.NaN, Number.NaN, this.cellSize], tag: "" };
  }

  set holder(value: IPositionMatrix) {
    this.positionMatrix = value;
  }

  checkPosition(): void {
    if (!this.positionMatrix || !this.visitableCell) {
      return;
    }
    const pos = this.positionMatrix.position;
    const [x, y, z] = getCellPos(pos, this.cellSize);
    if (this.cell.pos[0] !== x || this.cell.pos[1] !== y || this.cell.pos[2] !== z) {
      this.cell.pos[0] = x;
      this.cell.pos[1] = y;
      this.cell.pos[2] = z;
      this.cell.tag = cellTag(...this.cell.pos);
      this.visitableCell.visitCell(this.cell);
    }
  }

  activate(): void {
    super.activate();
    this.positionMatrix?.onChange(this.listener);
    this.cell.pos[0] = Number.NaN;
    this.cell.pos[1] = Number.NaN;
    this.cell.pos[2] = Number.NaN;
    this.checkPosition();
  }

  deactivate(): void {
    this.positionMatrix?.removeChangeListener(this.listener);
    super.deactivate();
  }
}
