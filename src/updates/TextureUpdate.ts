import { Refresh } from "./Refresh";
import { GraphicsEngine } from "core/GraphicsEngine";
import { Motor } from "core/Motor";
import { MediaId } from "gl/texture/ImageManager";
import { Media } from "gl/texture/Media";

export class TextureUpdate implements Refresh {
  private readonly updatedImageIds: Set<MediaId> = new Set();
  constructor(private motor: Motor, private getMedia: (imageId: MediaId) => Media | undefined, private engine: GraphicsEngine) {
  }

  withImageId(imageId: MediaId): TextureUpdate {
    this.updatedImageIds.add(imageId);
    return this;
  }

  informUpdate(imageId: MediaId) {
    this.motor.registerUpdate(this.withImageId(imageId));
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
