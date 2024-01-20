import { CellPos } from "../CellPos";
import { Vector } from "core/types/Vector";
import { CellPool } from "../../pools/CellPool";
import { Cell } from "../Cell";
import { VectorPool } from "world/pools/VectorPool";
import { IMotor } from "motor/IMotor";
import { Refresh } from "updates/Refresh";
import { UpdatePayload } from "updates/UpdatePayload";

interface Props {
  motor: IMotor;
}

interface Data {
  cellPool: CellPool;
  vectorPool: VectorPool;
}

export class CellUtils implements Refresh<Data> {
  private readonly cellPool: CellPool;
  private readonly vectorPool: VectorPool;

  constructor({ motor }: Props) {
    this.cellPool = new CellPool(() => motor.scheduleUpdate(this, data));
    this.vectorPool = new VectorPool(() => motor.scheduleUpdate(this, data));
    const data: Data = { cellPool: this.cellPool, vectorPool: this.vectorPool };
  }

  refresh({ data: { cellPool, vectorPool } }: UpdatePayload<Data>): void {
    cellPool.reset();
    vectorPool.reset();
  }

  getCell(pos: Vector, cellSize: number): Cell {
    return this.cellPool.create(pos, cellSize);
  }

  positionFromCell(cell: Cell): Vector {
    return this.positionFromCellPos(...cell.pos);
  }

  positionFromCellPos(cx: number, cy: number, cz: number, cellSize: number) {
    return this.vectorPool.create(cx * cellSize, cy * cellSize, cz * cellSize);
  }
}

export const cellPos: CellPos = [0, 0, 0, 0];
export const tempPos: Vector = [0, 0, 0];

export function cellTag(x: number, y: number, z: number, cellSize: number) {
  return `(${x},${y},${z})_${cellSize}`;
}

export function getCellPos(pos: Vector, cellSize: number): CellPos {
  cellPos[0] = Math.round(pos[0] / cellSize);
  cellPos[1] = Math.round(pos[1] / cellSize);
  cellPos[2] = Math.round(pos[2] / cellSize);
  cellPos[3] = cellSize;
  return cellPos;
}

export function positionFromCell(cellPos: CellPos): Vector {
  const [cx, cy, cz, cellSize] = cellPos;
  tempPos[0] = cx * cellSize;
  tempPos[1] = cy * cellSize;
  tempPos[2] = cz * cellSize;
  return tempPos;
}
