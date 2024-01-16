import { NumVal } from "core/value/NumVal";
import { IMatrix } from "./IMatrix";

export interface IAngleMatrix extends IMatrix {
  get angle(): NumVal;
}
