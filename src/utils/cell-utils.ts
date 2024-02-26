import { CellPool, Cell } from "cell-tracker";
import { VectorPool } from "dok-types";
import { IMotor, Cycle, UpdatePayload } from "motor-loop";
import { Vector } from "dok-types";

interface Props extends Partial<Data> {
  motor: IMotor;
}

interface Data {
  cellPool: CellPool;
  vectorPool: VectorPool;
}

export class CellUtils implements Cycle<Data> {
  private readonly cellPool: CellPool;
  private readonly vectorPool: VectorPool;
  private readonly motor;
  private readonly data;

  constructor({ motor, cellPool, vectorPool }: Props) {
    this.motor = motor;
    this.cellPool = cellPool ?? new CellPool();
    this.vectorPool = vectorPool ?? new VectorPool();
    this.data = { cellPool: this.cellPool, vectorPool: this.vectorPool };
  }

  refresh({ data: { cellPool, vectorPool } }: UpdatePayload<Data>): void {
    cellPool.recycleAll();
    vectorPool.recycleAll();
  }

  cellFromPos(pos: Vector, cellSize: number): Cell {
    this.motor.scheduleUpdate(this, this.data);
    return this.cellPool.createFromPos(pos, cellSize);
  }

  cellAt(x: number, y: number, z: number, cellSize: number): Cell {
    this.motor.scheduleUpdate(this, this.data);
    return this.cellPool.create(x, y, z, cellSize);
  }

  worldPosFromCell(cx: number, cy: number, cz: number, cellSize: number) {
    this.motor.scheduleUpdate(this, this.data);
    return this.vectorPool.create(cx * cellSize, cy * cellSize, cz * cellSize);
  }

  offset(vector: Vector, dx: number, dy: number, dz: number) {
    return this.vectorPool.create(vector[0] + dx, vector[1] + dy, vector[2] + dz);
  }
}
