import { Holder } from "world/aux/Holder";

export interface ICanvasHolder<T> extends Holder {
  readonly elem: T;
}
