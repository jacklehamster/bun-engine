import { CellTrack } from "./grid/CellTrack";
import { Holder } from "./aux/Holder";
import { Auxiliary } from "./aux/Auxiliary";
import { Core } from "core/Core";

interface IWorld extends Holder<IWorld>, CellTrack, Auxiliary<Core> {
}

export default IWorld;
