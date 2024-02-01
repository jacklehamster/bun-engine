import { IImageManager, ITextureManager, Media, MediaData, MediaId, SpriteSheet, TEXTURE_INDEX_FOR_VIDEO, TextureId } from "gl-texture-manager";
import { List, map } from "abstract-list";

interface Props {
  textureManager: ITextureManager;
  imageManager: IImageManager;
}

export class TextureUpdateHandler {
  private readonly textureSlots: Map<MediaId, { buffer: Float32Array }> = new Map();
  private textureManager: ITextureManager;
  private imageManager: IImageManager;

  constructor({ textureManager, imageManager }: Props) {
    this.textureManager = textureManager;
    this.imageManager = imageManager;
  }

  getSlotBuffer(id: MediaId): Float32Array | undefined {
    const slot = this.textureSlots.get(id);
    return slot?.buffer;
  }

  dispose(): void {
    this.textureSlots.clear();
  }

  async updateTextures(ids: Set<MediaId>, medias: List<Media>): Promise<MediaData[]> {
    const mediaList = Array.from(ids).map(index => medias.at(index));
    ids.clear();
    const mediaInfos = (await Promise.all(map(mediaList, async media => {
      if (media?.id === undefined) {
        return;
      }
      const mediaData = await this.imageManager.renderMedia(media.id, media);
      return { mediaData, mediaId: media.id, spriteSheet: media.spriteSheet };
    }))).filter((data): data is { mediaData: MediaData, mediaId: MediaId, spriteSheet: SpriteSheet | undefined } => !!data);
    const textureIndices = await Promise.all(mediaInfos.map(async ({ mediaData, mediaId, spriteSheet }) => {
      const { slot, refreshCallback } = this.textureManager.allocateSlotForImage(mediaData);
      const slotW = Math.log2(slot.size[0]), slotH = Math.log2(slot.size[1]);
      const wh = slotW * 16 + slotH;
      const [spriteWidth, spriteHeight] = spriteSheet?.spriteSize ?? [mediaData.width, mediaData.height];
      this.textureSlots.set(mediaId, {
        buffer: Float32Array.from([wh, slot.slotNumber, spriteWidth / mediaData.width, spriteHeight / mediaData.height]),
      });
      mediaData.refreshCallback = refreshCallback;
      return slot.textureIndex;
    }));
    const textureIndicesSet = new Set(textureIndices);
    textureIndicesSet.forEach(textureIndex => {
      if (textureIndex === TEXTURE_INDEX_FOR_VIDEO) {
        this.textureManager.setupTextureForVideo(`TEXTURE${textureIndex}` as TextureId);
      } else {
        this.textureManager.generateMipMap(`TEXTURE${textureIndex}` as TextureId);
      }
    });
    return mediaInfos.map(({ mediaData }) => mediaData);;
  }
}
