import { Media } from "gl/texture/Media";
import { List } from "./List";
import { UpdatableList } from "updates/UpdatableList";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { UpdateRegistry } from "updates/UpdateRegistry";

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
    },
      new UpdateRegistry(ids => {
        const imageIds = Array.from(ids);
        ids.clear();
        engine.updateTextures(imageIds, medias.at.bind(medias)).then((mediaInfos) => {
          mediaInfos.forEach(mediaInfo => {
            if (mediaInfo.isVideo) {
              motor.registerUpdate(mediaInfo, mediaInfo.schedule);
            }
          });
        });
      }, motor),
    );
  }
}
