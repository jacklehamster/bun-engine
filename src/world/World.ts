import IWorld from "./IWorld";
import { Auxiliary } from "./aux/Auxiliary";
import { AuxiliaryHolder } from "./aux/AuxiliaryHolder";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { Sprites } from "./sprite/Sprites";

interface Props {
  engine: IGraphicsEngine;
}

export abstract class World extends AuxiliaryHolder<IWorld> implements IWorld, Auxiliary {
  protected engine: IGraphicsEngine;
  private _sprites?: Sprites;

  constructor(props: Props) {
    super();
    const { engine } = props;
    this.engine = engine;
  }

  set sprites(value: Sprites) {
    this._sprites = value;
  }

  activate(): void {
    super.activate();
    this.engine.setMaxSpriteCount(this._sprites?.length ?? 0);
  }

  deactivate(): void {
    super.deactivate();
    this.engine.setMaxSpriteCount(0);
  }
}
