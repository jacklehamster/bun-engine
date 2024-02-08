import { Cell } from "world/grid/Cell";

export interface IBoundary {
  include(cell: Cell): boolean;
}
