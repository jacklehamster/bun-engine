import { Cell } from "world/grid/Cell";
import { List } from "../List";

export interface IElemFactory<T> {
  getElemsAtCell(cell: Cell): List<T>;
  doneCellTracking?(cell: Cell): void;
}
