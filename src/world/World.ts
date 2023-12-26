import IWorld from "./IWorld";
import { Core } from "core/Core";
import { Sprites } from "./sprite/Sprites";
import { ActivateProps, IdType } from "core/Active";
import { Media } from "gl/texture/Media";
import { Auxiliary } from "./aux/Auxiliary";
import { forEach } from "./sprite/List";
import { UpdatableMedias } from "./sprite/Medias";
import { AuxiliaryHolder } from "./aux/AuxiliaryHolder";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";

export abstract class World extends AuxiliaryHolder implements IWorld {
  public medias: UpdatableMedias;
  private spriteTransformUpdate;
  private spriteAnimUpdate;

  constructor(protected core: Core,
    auxiliaries: Auxiliary[]) {
    super(auxiliaries);
    this.medias = new UpdatableMedias(core)
    this.spriteTransformUpdate = new SpriteTransformUpdate(this.getSprite.bind(this), core.engine, core.motor);
    this.spriteAnimUpdate = new SpriteAnimUpdate(this.getSprite.bind(this), core.engine, core.motor);
  }

  abstract sprites: Sprites;

  private getSprite(id: IdType) {
    return this.sprites.at(id);
  }

  activate(activateProps: ActivateProps): () => void {
    const { core } = activateProps;

    const deregisterLoop = core.motor.loop(this);

    //  Update all sprites
    forEach(this.sprites, (_, id) => {
      this.spriteTransformUpdate.informUpdate(id);
      this.spriteAnimUpdate.informUpdate(id);
    });

    return () => {
      deregisterLoop();
    };
  }

  addMedia(...medias: Media[]) {
    for (let media of medias) {
      this.medias.set(media.id, media);
    }
  }
}
