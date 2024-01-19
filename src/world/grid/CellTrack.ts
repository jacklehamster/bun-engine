import { Cell } from "./CellPos";

export interface CellTrack {
  trackCell?(cell: Cell): boolean;
  untrackCell?(cellTag: string): void;
}
