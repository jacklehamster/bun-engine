import { Auxiliary } from "./Auxiliary";
import { AuxiliaryHolder } from "./AuxiliaryHolder";
import { Holder } from "./Holder";

export type IAuxiliaryHolder<H extends Holder = any> = Holder<AuxiliaryHolder<H>> & Auxiliary<H>;
