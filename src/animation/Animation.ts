import { Frame } from "world/sprite/Sprite";

export interface Animation {
  frames?: [Frame, Frame] | [Frame];
  fps?: number;
}
