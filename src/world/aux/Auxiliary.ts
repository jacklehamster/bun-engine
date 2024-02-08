import { Active } from "core/Active";
import { ICellTracker } from "world/grid/ICellTracker";
import { Holder } from "./Holder";

interface Held<H> {
  set holder(value: H);
}

export interface Auxiliary<H = Holder<any>> extends Partial<Active>, Partial<ICellTracker>, Partial<Held<H>> {
}
