import { Auxiliary } from "world/aux/Auxiliary";
import { SpritesHolder } from "./SpritesHolder";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
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
    value.addNewSpritesListener(this.onNewSprites.bind(this));
  }

  private onNewSprites() {
    this.updateCount();
  }

  private updateCount() {
    this.engine.setMaxSpriteCount(this.sprites?.length ?? 0);
  }

  activate(): void {
    this.updateCount();
  }

  deactivate(): void {
    this.engine.setMaxSpriteCount(0);
  }
}
