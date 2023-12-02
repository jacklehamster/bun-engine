import { Disposable } from "lifecycle/Disposable";
import { Url } from "./TextureManager";
import { MediaData } from "./MediaData";

export type ImageId = number;

export class ImageManager extends Disposable {
  private images: MediaData[] = [];

  hasImageId(imageId: ImageId): boolean {
    return !!this.getMedia(imageId);
  }

  getMedia(imageId: ImageId): MediaData {
    return this.images[imageId];
  }

  setImage(imageId: ImageId, mediaInfo: MediaData): void {
    this.images[imageId] = mediaInfo;
  }

  async drawImage(
    imageId: ImageId,
    drawProcedure: (context: OffscreenCanvasRenderingContext2D) => void,
  ): Promise<MediaData> {
    const canvas = new OffscreenCanvas(1, 1);
    drawProcedure(canvas.getContext('2d')!);
    const imageInfo = MediaData.createFromCanvas(canvas);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadCanvas(
    imageId: ImageId,
    canvas: HTMLCanvasElement | OffscreenCanvas,
  ): Promise<MediaData> {
    const imageInfo = MediaData.createFromCanvas(canvas);
    canvas.getContext('2d');
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadImage(imageId: ImageId, src: Url): Promise<MediaData> {
    const imageInfo = await MediaData.loadImage(src);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadVideo(
    imageId: ImageId,
    src: Url,
    volume?: number,
    fps?: number
  ): Promise<MediaData> {
    const videoInfo = await MediaData.loadVideo(src, volume, fps);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }

  async loadWebCam(
    imageId: ImageId,
    deviceId: string | undefined,
  ): Promise<MediaData> {
    const videoInfo = await MediaData.loadWebcam(deviceId);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }
}
