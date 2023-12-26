import { Media } from "gl/texture/Media";
import { List } from "./List";
import { UpdatableList } from "updates/UpdatableList";
import { Core } from "core/Core";
import { TextureUpdate } from "updates/TextureUpdate";

export type Medias = List<Media>;

export class UpdatableMedias extends UpdatableList<Media> {
  constructor(core: Core, medias: Media[] = []) {
    super(medias,
      (index, value) => medias[index] = value,
      new TextureUpdate(core.motor, medias.at.bind(medias), core.engine));
  }
}
