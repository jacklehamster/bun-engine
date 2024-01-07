import { Active } from "core/Active";
import { Refresh } from "updates/Refresh";
import { CellTrack } from "world/grid/CellTracker";

export interface Auxiliary extends Partial<Refresh>, Partial<Active>, Partial<CellTrack> {
}
