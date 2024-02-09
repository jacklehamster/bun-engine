import { Cell } from "cell-tracker";

export interface IBoundary {
  include(cell: Cell): boolean;
}
