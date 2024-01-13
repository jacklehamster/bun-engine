import { Cell } from "./CellPos";


export interface CellTrack {
  trackCell?(cell: Cell): void;
  untrackCell?(cellTag: string): void;
}
