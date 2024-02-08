import { Auxiliary } from "./Auxiliary";

export interface Holder<H extends Holder = any> {
  addAuxiliary(aux: Auxiliary<H>): this;
  removeAuxiliary(aux: Auxiliary<H>): void;
}
