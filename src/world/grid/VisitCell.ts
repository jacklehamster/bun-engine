import { Cell } from "world/grid/CellPos";

export interface VisitableCell {
  visitCell(cell: Cell): void;
};
