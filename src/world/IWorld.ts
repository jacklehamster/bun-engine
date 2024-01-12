import { CellTrack } from "./grid/CellTracker";
import { Holder } from "./aux/Holder";

interface IWorld extends Holder<IWorld>, CellTrack {
}

export default IWorld;
