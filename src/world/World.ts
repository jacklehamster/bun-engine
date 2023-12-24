import IWorld from "./IWorld";
import { Core } from "core/Core";
import { UpdatePayload } from "updates/Refresh";
import { Sprites } from "./sprite/Sprites";
import { ActivateProps, IdType, UpdateType } from "core/Active";
import { Media } from "gl/texture/Media";
import { Auxliary } from "./aux/Auxiliary";
import { forEach } from "./sprite/List";

export abstract class World implements IWorld {
  constructor(protected core: Core, protected auxiliaries: Auxliary[]) {
  }

  protected informUpdate(type: UpdateType, id: IdType): void {
    console.warn("pass onUpdate to inform about changes in the world.", type, id);
  }

  refresh(_update: UpdatePayload): void {
  }

  abstract sprites: Sprites;
  medias: Media[] = [];

  activate(activateProps: ActivateProps): () => void {
    const { updateCallback, core } = activateProps;
    this.informUpdate = updateCallback;

    this.auxiliaries.forEach(aux => aux.activate(activateProps));
    this.medias.forEach(media => this.informUpdate("Media", media.id));

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
      this.medias[media.id] = media;
    }
  }

  addAuxiliary(...aux: Auxliary[]) {
    this.auxiliaries.push(...aux);
  }
}
