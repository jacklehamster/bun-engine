import IWorld from "./IWorld";
import { Sprites } from "./sprite/Sprites";
import { Media } from "gl/texture/Media";
import { Auxiliary } from "./aux/Auxiliary";
import { UpdatableMedias } from "./sprite/Medias";
import { AuxiliaryHolder } from "./aux/AuxiliaryHolder";
import { SpritesAccumulator } from "./sprite/SpriteAccumulator";
import { Sprite } from "./sprite/Sprite";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export abstract class World extends AuxiliaryHolder implements IWorld, Auxiliary {
  public medias: UpdatableMedias;
  private spritesAccumulator;

  constructor(props: Props) {
    super();
    this.medias = new UpdatableMedias(props)
    this.spritesAccumulator = new SpritesAccumulator(props);
  }

  get sprites(): Sprites {
    return this.spritesAccumulator;
  }

  addMedia(...medias: Media[]) {
    medias.forEach(media => {
      this.medias.set(media.id, media);
    });
  }

  addSprites(...sprites: (Sprites | (Sprite & { length?: number }))[]) {
    sprites.forEach(s => {
      this.spritesAccumulator.add(s.length ? s as Sprites : [s as Sprite]);
    });
  }
}
