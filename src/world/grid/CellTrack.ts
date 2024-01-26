import { Cell } from "./Cell";

export interface CellTrack {
  trackCell?(cell: Cell): boolean;
  untrackCells(cellTags: Set<string>): void;
}
