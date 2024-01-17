import { UpdatePayload } from "updates/Refresh";
import { Cell } from "./CellPos";


export interface CellTrack {
  trackCell?(cell: Cell, updatePayload: UpdatePayload): boolean;
  untrackCell?(cellTag: string, updatePayload: UpdatePayload): void;
}
