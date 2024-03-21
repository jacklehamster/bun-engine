import { Media, MediaData, MediaId } from "gl-texture-manager";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { Updater } from "../../../updates/Updater";
import { IUpdatableList } from "list-accumulator";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  medias: IUpdatableList<Media> | Media[];
}

export class MediaUpdater extends Updater {
  readonly #savedMediaInfo = new Map<MediaId, MediaData>();
  readonly #motor: IMotor;

  constructor({ engine, motor, medias }: Props) {
    super({
      updateRegistry: new UpdateRegistry(ids => {
        ids.forEach(id => this.removeMedia(id));
        engine.updateTextures(ids, medias)
          .then((mediaInfos) => mediaInfos.forEach(mediaInfo => {
            if (mediaInfo.isVideo) {
              motor.scheduleUpdate(mediaInfo, undefined, mediaInfo.refreshRate);
              this.#savedMediaInfo.set(mediaInfo.id, mediaInfo);
            } else {
              mediaInfo.dispose();
            }
          }));
      }, motor),
      elems: medias as IUpdatableList<Media>,
    });
    this.#motor = motor;
  }

  removeMedia(id: MediaId) {
    const mediaInfo = this.#savedMediaInfo.get(id);
    if (mediaInfo) {
      this.#motor.stopUpdate(mediaInfo);
      mediaInfo.dispose();
      this.#savedMediaInfo.delete(id);
    }
  }

  deactivate(): void {
    this.#dispose();
  }

  #dispose() {
    this.#savedMediaInfo.forEach(mediaInfo => this.removeMedia(mediaInfo.id));
  }
}
