import { UpdatePayload } from "updates/Refresh";
import { Cell } from "world/grid/CellPos";

export interface VisitableCell {
  readonly visitCell: (cell: Cell, updatePayload: UpdatePayload) => void;
};
