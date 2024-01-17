import { UpdateNotifier } from "updates/UpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { MediasHolder } from "../aux/MediasHolder";
import { Medias } from "gl/texture/Media";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { MediaId } from "gl/texture/ImageManager";
import { UpdateRegistry } from "updates/UpdateRegistry";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class MediaUpdater implements UpdateNotifier, Auxiliary<MediasHolder> {
  private medias?: Medias;
  private mediaRegistry: UpdateRegistry;

  constructor({ engine, motor }: Props) {
    this.mediaRegistry = new UpdateRegistry(ids => {
      const imageIds = Array.from(ids).map(index => this.medias?.at(index)?.id);
      ids.clear();
      engine.updateTextures(imageIds, index => this.medias?.at(index))
        .then((mediaInfos) => {
          mediaInfos.forEach(mediaInfo => {
            if (mediaInfo.isVideo) {
              motor.registerUpdate(mediaInfo, mediaInfo.schedule);
            }
          });
        });
    }, motor);
  }

  set holder(value: MediasHolder) {
    this.medias = value;
    value.informUpdate = this.informUpdate.bind(this);
  }

  informUpdate(index: MediaId): void {
    this.mediaRegistry.informUpdate(index);
  }
}
