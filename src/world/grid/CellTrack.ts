import { UpdatePayload } from "updates/Refresh";
import { Cell } from "./CellPos";


export interface CellTrack {
  trackCell?(cell: Cell, updatePayload: UpdatePayload): void;
  untrackCell?(cellTag: string, updatePayload: UpdatePayload): void;
}
