import { CellTrack } from "./grid/CellTrack";
import { Holder } from "./aux/Holder";
import { Auxiliary } from "./aux/Auxiliary";

interface IWorld<T = Record<string, any>> extends Holder<IWorld>, CellTrack, Auxiliary {
  api?: T;
}

export default IWorld;
