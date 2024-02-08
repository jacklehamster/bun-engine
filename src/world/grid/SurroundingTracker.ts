import { Cell, Tag } from "./Cell";
import { CellUtils } from "./utils/cell-utils";
import { IVisitableCell } from "./IVisitableCell";
import { DoubleLinkList, FreeStack } from "free-stack";
import { ICellTracker } from "./ICellTracker";

interface Config {
  range?: [number, number, number];
  cellLimit?: number;
  cellSize?: number;
}

interface Props {
  cellTrack: ICellTracker;
  cellUtils: CellUtils;
}

export class SurroundingTracker implements IVisitableCell {
  private readonly cellTags: FreeStack<Tag> = new DoubleLinkList<Tag>("");
  private readonly cellTrack;
  private readonly cellUtils;
  private range: [number, number, number];
  private base: [number, number, number];
  private cellLimit: number;
  private cellSize: number;
  private readonly _trimmedTags: Set<string> = new Set();

  constructor({ cellTrack, cellUtils }: Props, { range, cellLimit, cellSize = 1 }: Config = {}) {
    this.range = [range?.[0] ?? 3, range?.[1] ?? 3, range?.[2] ?? 3];
    this.base = this.range.map(r => Math.ceil(-r / 2)) as [number, number, number];
    this.cellLimit = Math.max(0, cellLimit ?? 10);
    this.cellSize = cellSize ?? 1;
    this.cellTrack = cellTrack;
    this.cellUtils = cellUtils;
  }

  iterateCells(visitedCell: Cell, callback: (cell: Cell) => void) {
    const { range, base } = this;
    const { pos: pos } = visitedCell;
    const cellX = pos[0] + base[0];
    const cellY = pos[1] + base[1];
    const cellZ = pos[2] + base[2];
    for (let z = 0; z < range[0]; z++) {
      for (let x = 0; x < range[2]; x++) {
        for (let y = 0; y < range[1]; y++) {
          callback(this.cellUtils.cellAt(cellX + x, cellY + y, cellZ + z, this.cellSize));
        }
      }
    }
  }

  onCellVisit = (cell: Cell) => {
    if (!this.cellTags.contains(cell.tag)) {
      if (this.cellTrack.trackCell?.(cell)) {
        this.cellTags.pushTop(cell.tag);
      }
    } else {
      this.cellTags.moveToTop(cell.tag);
    }
  }

  visitCell(visitedCell: Cell): void {
    this.iterateCells(visitedCell, this.onCellVisit);
    this.trimCells();
  }

  trimCells() {
    //  remove any excess cells (oldest visited first)
    while (this.cellTags.size > this.cellLimit) {
      const removedTag = this.cellTags.popBottom();
      if (removedTag) {
        this._trimmedTags.add(removedTag);
      } else {
        break;
      }
    }
    if (this._trimmedTags.size) {
      this.cellTrack.untrackCells?.(this._trimmedTags);
      this._trimmedTags.clear();
    }
  }

  deactivate(): void {
    this.cellTags.clear();
  }
}
