import IWorld from "./IWorld";
import { Sprites } from "./sprite/Sprites";
import { Media } from "gl/texture/Media";
import { Auxiliary } from "./aux/Auxiliary";
import { UpdatableMedias } from "./sprite/Medias";
import { AuxiliaryHolder } from "./aux/AuxiliaryHolder";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { SpritesAccumulator } from "./sprite/SpriteAccumulator";
import { RefreshOrder } from "updates/RefreshOrder";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export abstract class World extends AuxiliaryHolder implements IWorld, Auxiliary {
  public readonly medias: UpdatableMedias;
  private readonly spritesAccumulator;
  protected engine: IGraphicsEngine;
  protected motor: IMotor;

  constructor(props: Props) {
    super();
    const { engine, motor } = props;
    this.engine = engine;
    this.motor = motor;
    this.medias = new UpdatableMedias(props)
    this.spritesAccumulator = new SpritesAccumulator(props);
  }
  refreshOrder?: RefreshOrder | undefined;

  activate(world: IWorld): void | (() => void) {
    const deActivate = super.activate(world);
    this.engine.setMaxSpriteCount(this.sprites.length);
    console.log("Sprite limit:", this.sprites.length);
    return () => deActivate?.();
  }

  get sprites(): Sprites {
    return this.spritesAccumulator;
  }

  addMedia(...medias: Media[]) {
    medias.forEach(media => {
      this.medias.set(media.id, media);
    });
  }

  addSprites(...sprites: Sprites[]) {
    sprites.forEach(spriteList => {
      this.spritesAccumulator.add(spriteList);
    });
  }
}
