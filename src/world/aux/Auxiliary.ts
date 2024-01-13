import { Active } from "core/Active";
import { Refresh } from "updates/Refresh";
import { CellTrack } from "world/grid/CellTrack";
import { Holder } from "./Holder";

interface Held<H = Holder<any>> {
  set holder(value: H | undefined);
}

export interface Auxiliary<H = Holder<any>> extends Partial<Refresh>, Partial<Active>, Partial<CellTrack>, Partial<Held<H>> {
}
