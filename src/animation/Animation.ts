import { UpdateNotifier } from "updates/UpdateNotifier";
import { List } from "world/sprite/List";
import { Frame } from "world/sprite/Sprite";

export type AnimationId = number;
export interface Animation {
  id?: AnimationId;
  frames?: [Frame, Frame] | [Frame];
  fps?: number;
  maxFrameCount?: Frame;
}

export type Animations = List<Animation> & Partial<UpdateNotifier>;
