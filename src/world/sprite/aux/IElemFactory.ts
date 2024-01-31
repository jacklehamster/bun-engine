import { Cell } from "world/grid/Cell";
import { List } from "abstract-list";

export interface IElemFactory<T> {
  getElemsAtCell(cell: Cell): List<T> | undefined;
  doneCellTracking?(cell: Cell): void;
}
