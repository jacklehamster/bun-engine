import { Auxiliary } from "./Auxiliary";

export interface Holder<H extends Holder = any> extends Auxiliary<H> {
  addAuxiliary(...aux: Auxiliary<H>[]): void;
}
