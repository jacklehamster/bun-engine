import { Cell } from "./Cell";

export interface CellTrack {
  trackCell?(cell: Cell): boolean;
  untrackCell?(cellTag: string): void;
}
