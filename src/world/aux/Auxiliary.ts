import { Active } from "core/Active";
import { Refresh } from "updates/Refresh";
import { CellTrack } from "world/grid/CellTracker";
import { Holder } from "./Holder";

interface Held<H extends Holder = Holder<any>> {
  set holder(value: H | undefined);
}

export interface Auxiliary<H extends Holder = Holder<any>> extends Partial<Refresh>, Partial<Active>, Partial<CellTrack>, Partial<Held<H>> {
}
