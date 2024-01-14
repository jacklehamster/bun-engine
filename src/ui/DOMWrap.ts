import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { ICanvasHolder } from "./IDOMHolder";

export class DOMWrap<T> extends AuxiliaryHolder<DOMWrap<T>> implements ICanvasHolder<T> {
  constructor(public elem: T) {
    super();
  }
}
