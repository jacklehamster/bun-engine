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

  cellFromPos(pos: Vector, cellSize: number): Cell {
    return this.cellPool.createFromPos(pos, cellSize);
  }

  cellAt(x: number, y: number, z: number, cellSize: number): Cell {
    return this.cellPool.create(x, y, z, cellSize);
  }

  positionFromCell(cell: Cell): Vector {
    return this.positionFromCellPos(...cell.pos);
  }

  positionFromCellPos(cx: number, cy: number, cz: number, cellSize: number) {
    return this.vectorPool.create(cx * cellSize, cy * cellSize, cz * cellSize);
  }
}
