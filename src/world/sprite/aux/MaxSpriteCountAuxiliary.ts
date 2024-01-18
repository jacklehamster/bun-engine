import { Auxiliary } from "world/aux/Auxiliary";
import { SpritesHolder } from "./SpritesHolder";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";

interface Props {
  engine: IGraphicsEngine;
}

export class MaxSpriteCountAuxiliary implements Auxiliary<SpritesHolder> {
  private engine: IGraphicsEngine;
  private sprites?: SpritesHolder;
  constructor({ engine }: Props) {
    this.engine = engine;
  }

  set holder(value: SpritesHolder) {
    this.sprites = value;
    this.sprites.addNewElemsListener(this.updateCount.bind(this));
  }

  private updateCount() {
    this.engine.setMaxSpriteCount(this.sprites?.length ?? 0);
  }

  activate(): void {
    this.updateCount();
  }
}
