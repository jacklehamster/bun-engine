import { Auxiliary } from "world/aux/Auxiliary";
import { SpritesHolder } from "./SpritesHolder";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { Sprites } from "../Sprites";

interface Props {
  engine: IGraphicsEngine;
}

export class MaxSpriteCountAuxiliary implements Auxiliary<SpritesHolder> {
  private engine: IGraphicsEngine;
  private sprites?: Sprites;
  constructor({ engine }: Props) {
    this.engine = engine;
  }

  set holder(value: SpritesHolder) {
    this.sprites = value;
    value.addNewElemsListener(this.updateCount.bind(this));
  }

  private updateCount() {
    this.engine.setMaxSpriteCount(this.sprites?.length ?? 0);
  }

  activate(): void {
    this.updateCount();
  }
}
