import { Cell } from "world/grid/CellPos";
import { UpdatePayload } from "updates/Refresh";
import { List } from "../List";

export interface IElemFactory<T> {
  getElemsAtCell(cell: Cell, updatePayload: UpdatePayload): List<T>;
  doneCellTracking?(cell: Cell, updatePayload: UpdatePayload): void;
}
