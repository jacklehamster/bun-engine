import IWorld from "./IWorld";
import { Core } from "core/Core";
import { Sprites } from "./sprite/Sprites";
import { ActivateProps, IdType } from "core/Active";
import { UpdateType } from "updates/UpdateManager";
import { Media } from "gl/texture/Media";
import { Auxiliary } from "./aux/Auxiliary";
import { forEach } from "./sprite/List";
import { UpdatableMedias } from "./sprite/Medias";
import { AuxiliaryHolder } from "./aux/AuxiliaryHolder";

export abstract class World extends AuxiliaryHolder implements IWorld {
  public medias: UpdatableMedias;
  constructor(protected core: Core,
    auxiliaries: Auxiliary[]) {
    super(auxiliaries);
    this.medias = new UpdatableMedias(core)
  }

  protected informUpdate(type: UpdateType, id: IdType): void {
    console.warn("pass onUpdate to inform about changes in the world.", type, id);
  }

  abstract sprites: Sprites;

  activate(activateProps: ActivateProps): () => void {
    const { updateCallback, core } = activateProps;
    this.informUpdate = updateCallback;

    const deregisterLoop = core.motor.loop(this);

    //  Update all sprites
    forEach(this.sprites, (_, id) => {
      this.informUpdate("SpriteTransform", id);
      this.informUpdate("SpriteAnim", id);
    });

    return () => {
      this.informUpdate = () => { };
      deregisterLoop();
    };
  }

  addMedia(...medias: Media[]) {
    for (let media of medias) {
      this.medias.set(media.id, media);
    }
  }
}
