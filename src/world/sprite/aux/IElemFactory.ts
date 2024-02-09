import { Cell } from "cell-tracker";
import { List } from "abstract-list";

export interface IElemFactory<T> {
  getElemsAtCell(cell: Cell): List<T> | undefined;
  doneCellTracking?(cell: Cell): void;
}
