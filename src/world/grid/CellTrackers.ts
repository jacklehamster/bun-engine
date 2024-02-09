import { Cell } from "./Cell";
import { ICellTracker } from "./ICellTracker";

export class CellTrackers implements ICellTracker {
  #cellTrackers = new Set<ICellTracker>();

  add(cellTracker: ICellTracker) {
    this.#cellTrackers.add(cellTracker);
  }

  remove(cellTracker: ICellTracker) {
    this.#cellTrackers.delete(cellTracker);
  }

  trackCell?(cell: Cell): boolean {
    let track = false;
    this.#cellTrackers.forEach(tracker => {
      if (tracker.trackCell?.(cell)) {
        track = true;
      }
    });
    return track;
  }
  untrackCells(cellTags: Set<string>): void {
    this.#cellTrackers.forEach(tracker => {
      tracker.untrackCells(cellTags);
    });
  }

}
