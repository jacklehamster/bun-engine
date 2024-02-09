import { Cell, ICellTracker } from "cell-tracker";
import { IBoundary } from "./IBoundary";
import { ICellCreator } from "./ICellCreator";

interface Props {
  boundary?: IBoundary;
  cellCreator: ICellCreator<any>;
}

export class Grid implements ICellTracker {
  private readonly boundary?: IBoundary;
  readonly #cellCreator: ICellCreator<any>;

  constructor({ boundary, cellCreator }: Props) {
    this.boundary = boundary;
    this.#cellCreator = cellCreator;
  }

  trackCell(cell: Cell): boolean {
    if (this.boundary && !this.boundary.include(cell)) {
      return false;
    }
    return this.#cellCreator.createCell(cell);
  }

  untrackCells(cellTags: Set<string>): void {
    this.#cellCreator.destroyCells(cellTags);
  }
}
