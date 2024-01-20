import { Media } from "gl/texture/Media";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { Updater } from "./Updater";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class MediaUpdater extends Updater<Media> {
  constructor({ engine, motor }: Props) {
    super(new UpdateRegistry(ids => {
      if (!this.elems) {
        return;
      }
      engine.updateTextures(ids, this.elems)
        .then((mediaInfos) => mediaInfos.filter(({ isVideo }) => isVideo)
          .forEach(mediaInfo => motor.scheduleUpdate(mediaInfo, undefined, mediaInfo.refreshRate))
        );
    }, motor));
  }
}
