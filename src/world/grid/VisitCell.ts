import { UpdatePayload } from "updates/Refresh";
import { Cell } from "world/grid/CellPos";

export interface VisitCell {
  readonly visitCell: (cell: Cell, updatePayload?: UpdatePayload) => void;
};
