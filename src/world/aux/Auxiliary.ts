import { Active } from "core/Active";
import { ICellTracker } from "world/grid/ICellTracker";

export interface Auxiliary extends Partial<Active>, Partial<ICellTracker> {
}
