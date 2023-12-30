import IWorld from "./IWorld";
import { Sprites } from "./sprite/Sprites";
import { IdType } from "core/IdType";
import { Media } from "gl/texture/Media";
import { Auxiliary } from "./aux/Auxiliary";
import { forEach } from "./sprite/List";
import { UpdatableMedias } from "./sprite/Medias";
import { AuxiliaryHolder } from "./aux/AuxiliaryHolder";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";
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
  private spriteTransformUpdate;
  private spriteAnimUpdate;
  private spritesAccumulator = new SpritesAccumulator();

  constructor(props: Props) {
    super();
    const { engine, motor } = props;
    this.medias = new UpdatableMedias(props)
    this.spriteTransformUpdate = new SpriteTransformUpdate(this.getSprite.bind(this), engine, motor);
    this.spriteAnimUpdate = new SpriteAnimUpdate(this.getSprite.bind(this), engine, motor);
  }

  get sprites(): Sprites {
    return this.spritesAccumulator;
  }

  private getSprite(id: IdType) {
    return this.sprites.at(id);
  }

  activate(): () => void {
    const onDeactivate = super.activate();
    //  Update all sprites
    forEach(this.sprites, (_, id) => {
      this.spriteTransformUpdate.informUpdate(id);
      this.spriteAnimUpdate.informUpdate(id);
    });
    return () => {
      onDeactivate();
    };
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
