import { List } from "world/sprite/List";
import { Cell, cellTag } from "./CellPos";
import { VisitableCell } from "./VisitCell";
import { DoubleLinkList } from "../../utils/DoubleLinkList";
import { FreeStack } from "utils/FreeStack";
import { CellTrack } from "./CellTrack";
import { Auxiliary } from "world/aux/Auxiliary";
import { CellChangeAuxiliary } from "gl/transform/aux/CellChangeAuxiliary";
import { UpdatePayload } from "updates/Refresh";

interface Config {
  range?: [number, number, number];
  cellLimit?: number;
  cellSize?: number;
}

export class CellTracker implements VisitableCell, Auxiliary<CellChangeAuxiliary> {
  private range: [number, number, number];
  private base: [number, number, number];
  private cellLimit: number;
  private cellSize: number;
  private tempCell: Cell;

  set holder(aux: CellChangeAuxiliary) {
    aux.visitCell = this;
  }

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

  iterateCells(visitedCell: Cell, updatePayload: UpdatePayload, callback: (cell: Cell, update: UpdatePayload) => void) {
    const { range, base, tempCell } = this;
    const { pos } = visitedCell;
    const cellX = pos[0] + base[0];
    const cellY = pos[1] + base[1];
    const cellZ = pos[2] + base[2];
    const tempCellPos = tempCell.pos;
    for (let z = 0; z < range[0]; z++) {
      for (let x = 0; x < range[2]; x++) {
        for (let y = 0; y < range[1]; y++) {
          tempCellPos[0] = cellX + x;
          tempCellPos[1] = cellY + y;
          tempCellPos[2] = cellZ + z;
          tempCell.tag = cellTag(tempCellPos[0], tempCellPos[1], tempCellPos[2], tempCellPos[3]);
          callback(tempCell, updatePayload);
        }
      }
    }
  }

  onCellVisit(cell: Cell, updatePayload: UpdatePayload) {
    if (!this.cellTags.contains(cell.tag)) {
      if (this.cellTrack.trackCell?.(cell, updatePayload)) {
        this.cellTags.pushTop(cell.tag);
      }
    } else {
      this.cellTags.moveTop(cell.tag);
    }
  }

  visitCell(visitedCell: Cell, updatePayload: UpdatePayload): void {
    this.iterateCells(visitedCell, updatePayload, this.onCellVisit);
    this.trimCells(updatePayload);
  }

  trimCells(updatePayload: UpdatePayload) {
    //  remove any excess cells (oldest visited first)
    while (this.cellTags.size > this.cellLimit) {
      const removedTag = this.cellTags.popBottom();
      if (removedTag) {
        this.cellTrack.untrackCell?.(removedTag, updatePayload);
      }
    }
  }

  deactivate(): void {
    this.cellTags.clear();
  }
}
