import { Update } from "./Update";
import { GraphicsEngine } from "core/GraphicsEngine";
import { Motor } from "core/Motor";
import { ImageId } from "gl/texture/ImageManager";
import { Media } from "gl/texture/Media";

export class TextureUpdate implements Update {
  private readonly updatedImageIds: Set<ImageId> = new Set();
  constructor(private motor: Motor, private getMedia: (imageId: ImageId) => Media | undefined, private engine: GraphicsEngine) {
  }

  withImageId(imageId: ImageId): TextureUpdate {
    this.updatedImageIds.add(imageId);
    return this;
  }

  update(): void {
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
