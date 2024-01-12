import { Auxiliary } from "./Auxiliary";

export interface Holder<H extends Holder = any> {
  addAuxiliary(...aux: Auxiliary<H>[]): void;
  removeAuxiliary(...aux: Auxiliary<H>[]): void;
}
