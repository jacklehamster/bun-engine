import { List } from "world/sprite/List";
import { Cell, cellTag } from "./CellPos";
import { VisitCell } from "./VisitCell";

interface Config {
  range?: [number, number, number];
  cellLimit?: number;
  cellSize?: number;
}

interface DoubleList<T> {
  value: T;
  prev?: DoubleList<T>;
  next?: DoubleList<T>;
}

export interface CellTrack {
  trackCell?(cell: Cell): void;
  untrackCell?(cellTag: string): void;
}

export class CellTracker implements VisitCell {
  private range: [number, number, number];
  private base: [number, number, number];
  private cellLimit: number;
  private cellSize: number;
  private tempCell: Cell;

  private readonly cellTagVisitsStart: DoubleList<string>;
  private readonly cellTagVisitsEnd: DoubleList<string>;
  private cellTagMap: Map<string, DoubleList<string>> = new Map();

  constructor(private cellTrack: CellTrack, { range, cellLimit, cellSize = 1 }: Config = {}) {
    this.range = [range?.[0] ?? 3, range?.[1] ?? 3, range?.[2] ?? 3];
    this.base = this.range.map(r => Math.ceil(-r / 2)) as [number, number, number];

    this.cellLimit = Math.max(0, cellLimit ?? 10);
    this.cellSize = cellSize ?? 1;
    this.cellTagVisitsStart = { value: "start" };
    this.cellTagVisitsEnd = { value: "end" };
    this.cellTagVisitsStart.next = this.cellTagVisitsEnd;
    this.cellTagVisitsEnd.prev = this.cellTagVisitsStart;
    this.tempCell = {
      pos: [0, 0, 0, this.cellSize],
      tag: "",
    };
  }

  getCellTags(): List<string> {
    const tags: string[] = [];
    for (let e = this.cellTagVisitsStart.next; e !== this.cellTagVisitsEnd; e = e!.next) {
      tags.push(e!.value);
    }
    return tags;
  }

  iterateCells(visitedCell: Cell, callback: (cell: Cell) => void) {
    const { range, base, tempCell } = this;
    const { pos } = visitedCell;
    for (let z = 0; z < range[0]; z++) {
      for (let x = 0; x < range[2]; x++) {
        for (let y = 0; y < range[1]; y++) {
          tempCell.pos[0] = pos[0] + x + base[0];
          tempCell.pos[1] = pos[1] + y + base[1];
          tempCell.pos[2] = pos[2] + z + base[2];
          tempCell.tag = cellTag(...tempCell.pos);
          callback(tempCell);
        }
      }
    }
  }

  visitCell(visitedCell: Cell): void {
    this.iterateCells(visitedCell, cell => {
      let entry = this.cellTagMap.get(cell.tag);
      if (entry) {
        //  remove to add at the end later
        if (entry.prev) {
          entry.prev.next = entry.next;
        }
        if (entry.next) {
          entry.next.prev = entry.prev;
        }
        entry.prev = undefined;
        entry.next = undefined;
      } else {
        //  create and track
        this.cellTrack.trackCell?.(cell);
        entry = { value: cell.tag };
        this.cellTagMap.set(cell.tag, entry);
      }

      //  add at the end
      entry.prev = this.cellTagVisitsEnd.prev;
      entry.prev!.next = entry;
      this.cellTagVisitsEnd.prev = entry;
      entry.next = this.cellTagVisitsEnd;
    });

    //  remove any excess cells
    while (this.cellTagMap.size > this.cellLimit && this.cellTagVisitsStart) {
      const entryToRemove = this.cellTagVisitsStart.next!;
      const newFirstEntry = entryToRemove.next!;
      this.cellTagMap.delete(entryToRemove.value);
      this.cellTagVisitsStart.next = newFirstEntry;
      newFirstEntry.prev = this.cellTagVisitsStart;
      this.cellTrack.untrackCell?.(entryToRemove.value);
    }
  }
}
