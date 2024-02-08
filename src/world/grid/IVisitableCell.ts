import { Active } from "core/Active";
import { Cell } from "./Cell";
import { Auxiliary } from "world/aux/Auxiliary";

export interface IVisitableCell extends Auxiliary {
  visitCell(cell: Cell): void;
};
