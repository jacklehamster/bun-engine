import { UpdateNotifier } from "updates/UpdateNotifier";
import { List } from "./List";
import { Sprite } from "./Sprite";

export type Sprites = List<Sprite> & Partial<UpdateNotifier>;
