import { Media } from "gl/texture/Media";
import { List } from "./List";
import { UpdatableList } from "updates/UpdatableList";
import { TextureUpdate } from "updates/TextureUpdate";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";

export type Medias = List<Media>;

interface Props {
  motor: IMotor;
  engine: IGraphicsEngine;
}

export class UpdatableMedias extends UpdatableList<Media> {
  constructor({ motor, engine }: Props, medias: (Media | undefined)[] = []) {
    super(medias, (index, value) => {
      medias[index] = value;
      while (!medias[medias.length - 1]) {
        medias.length--;
      }
    }, new TextureUpdate(motor, medias.at.bind(medias), engine));
  }
}
