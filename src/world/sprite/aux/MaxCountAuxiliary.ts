import { Auxiliary } from "world/aux/Auxiliary";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { ElemsHolder, NewElemListener } from "./ElemsHolder";

interface Props {
  engine: IGraphicsEngine;
  elems: ElemsHolder<any>;
}

export class MaxCountAuxiliary implements Auxiliary, NewElemListener<any> {
  private readonly engine: IGraphicsEngine;
  private readonly elems: ElemsHolder<any>;
  constructor({ engine, elems }: Props) {
    this.engine = engine;
    this.elems = elems;
  }

  onNewElem(): void {
    this.updateCount();
  }

  private updateCount() {
    this.engine.setMaxSpriteCount(this.elems.length);
  }

  activate(): void {
    this.elems.addNewElemsListener(this);
    this.updateCount();
  }

  deactivate(): void {
    this.updateCount();
    this.elems.removeNewElemsListener(this);
  }
}
