import { Media, MediaData, MediaId } from "gl-texture-manager";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { Updater } from "../../../updates/Updater";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class MediaUpdater extends Updater<Media> {
  #savedMediaInfo = new Map<MediaId, MediaData>();
  private readonly motor: IMotor;

  constructor({ engine, motor }: Props) {
    super(new UpdateRegistry(ids => {
      if (!this.elems) {
        return;
      }
      ids.forEach(id => this.removeMedia(id));
      engine.updateTextures(ids, this.elems)
        .then((mediaInfos) => mediaInfos.forEach(mediaInfo => {
          if (mediaInfo.isVideo) {
            motor.scheduleUpdate(mediaInfo, undefined, mediaInfo.refreshRate);
            this.#savedMediaInfo.set(mediaInfo.id, mediaInfo);
          } else {
            mediaInfo.dispose();
          }
        }));
    }, motor));
    this.motor = motor;
  }

  removeMedia(id: MediaId) {
    const mediaInfo = this.#savedMediaInfo.get(id);
    if (mediaInfo) {
      this.motor.stopUpdate(mediaInfo);
      mediaInfo.dispose();
      this.#savedMediaInfo.delete(id);
    }
  }

  dispose() {
    this.#savedMediaInfo.forEach(mediaInfo => this.removeMedia(mediaInfo.id));
  }
}
