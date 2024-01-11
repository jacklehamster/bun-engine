import { List } from "world/sprite/List";
import { Cell, cellTag } from "./CellPos";
import { VisitCell } from "./VisitCell";
import { DoubleLinkList } from "../../utils/DoubleLinkList";
import { FreeStack } from "utils/FreeStack";

interface Config {
  range?: [number, number, number];
  cellLimit?: number;
  cellSize?: number;
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

  private readonly cellTags: FreeStack<string> = new DoubleLinkList<string>("");

  constructor(private cellTrack: CellTrack, { range, cellLimit, cellSize = 1 }: Config = {}) {
    this.range = [range?.[0] ?? 3, range?.[1] ?? 3, range?.[2] ?? 3];
    this.base = this.range.map(r => Math.ceil(-r / 2)) as [number, number, number];

    this.cellLimit = Math.max(0, cellLimit ?? 10);
    this.cellSize = cellSize ?? 1;
    this.tempCell = {
      pos: [0, 0, 0, this.cellSize],
      tag: "",
    };
    this.onCellVisit = this.onCellVisit.bind(this);
  }

  getCellTags(): List<string> {
    return this.cellTags.getList();
  }

  iterateCells(visitedCell: Cell, callback: (cell: Cell) => void) {
    const { range, base, tempCell } = this;
    const { pos } = visitedCell;
    const cellX = pos[0] + base[0];
    const cellY = pos[1] + base[1];
    const cellZ = pos[2] + base[2];
    for (let z = 0; z < range[0]; z++) {
      for (let x = 0; x < range[2]; x++) {
        for (let y = 0; y < range[1]; y++) {
          tempCell.pos[0] = cellX + x;
          tempCell.pos[1] = cellY + y;
          tempCell.pos[2] = cellZ + z;
          tempCell.tag = cellTag(...tempCell.pos);
          callback(tempCell);
        }
      }
    }
  }

  onCellVisit(cell: Cell) {
    if (!this.cellTags.remove(cell.tag)) {
      this.cellTrack.trackCell?.(cell);
    }
    this.cellTags.pushTop(cell.tag);
  }

  visitCell(visitedCell: Cell): void {
    this.iterateCells(visitedCell, this.onCellVisit);

    //  remove any excess cells (oldest visited first)
    while (this.cellTags.size > this.cellLimit) {
      const removedTag = this.cellTags.popBottom();
      if (removedTag) {
        this.cellTrack.untrackCell?.(removedTag);
      }
    }
  }
}
