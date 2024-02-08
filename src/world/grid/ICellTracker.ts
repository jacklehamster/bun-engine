import { Cell } from "./Cell";

export interface ICellTracker {
  trackCell?(cell: Cell): boolean;
  untrackCells(cellTags: Set<string>): void;
}
