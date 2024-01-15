import { Cell } from "world/grid/CellPos";
import { Sprites } from "../Sprites";
import { UpdatePayload } from "updates/Refresh";

export interface ISpriteFactory {
  getSpritesAtCell?(cell: Cell, updatePayload: UpdatePayload): Sprites;
  doneCellTracking?(cell: Cell, updatePayload: UpdatePayload): void;
}
