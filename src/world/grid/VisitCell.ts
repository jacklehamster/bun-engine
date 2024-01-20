import { Cell } from "./Cell";

export interface VisitableCell {
  visitCell(cell: Cell): void;
};
