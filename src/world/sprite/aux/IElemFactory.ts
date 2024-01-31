import { Cell } from "world/grid/Cell";
import { List } from "../../../core/List";

export interface IElemFactory<T> {
  getElemsAtCell(cell: Cell): List<T> | undefined;
  doneCellTracking?(cell: Cell): void;
}
