import { CellTrack } from "./grid/CellTracker";
import { Holder as Holder } from "./aux/Holder";
import { Sprites } from "./sprite/Sprites";

interface IWorld extends Holder, CellTrack {
  set sprites(value: Sprites);
}

export default IWorld;
