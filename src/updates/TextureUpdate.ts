import { Refresh } from "./Refresh";
import { MediaId } from "gl/texture/ImageManager";
import { Media } from "gl/texture/Media";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";

export class TextureUpdate implements Refresh, UpdateNotifier {
  private readonly updatedImageIds: Set<MediaId> = new Set();
  constructor(private motor: IMotor, private getMedia: (imageId: MediaId) => Media | undefined, private engine: IGraphicsEngine) {
  }

  informUpdate(imageId: MediaId) {
    if (!this.updatedImageIds.has(imageId)) {
      this.updatedImageIds.add(imageId);
      this.motor.registerUpdate(this);
    }
  }

  refresh(): void {
    const imageIds = Array.from(this.updatedImageIds);
    this.updatedImageIds.clear();
    this.engine.updateTextures(imageIds, this.getMedia).then((mediaInfos) => {
      mediaInfos.forEach(mediaInfo => {
        if (mediaInfo.isVideo) {
          this.motor.registerUpdate(mediaInfo, mediaInfo.schedule);
        }
      });
    });
  }
}
