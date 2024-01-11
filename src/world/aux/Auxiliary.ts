import { Active } from "core/Active";
import { Refresh } from "updates/Refresh";
import { CellTrack } from "world/grid/CellTracker";
import { AuxiliaryHolder } from "./AuxiliaryHolder";
import { Holder } from "./Holder";

interface Held<H extends Holder = AuxiliaryHolder> {
  set holder(value: H | undefined);
}

export interface Auxiliary<H extends Holder = AuxiliaryHolder> extends Partial<Refresh>, Partial<Active>, Partial<CellTrack>, Partial<Held<H>> {
}
