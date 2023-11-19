import { Disposable } from "disposable/Disposable";
import { ImageId, Url } from "./TextureManager";
import { MediaInfo } from "./MediaInfo";

export class ImageManager extends Disposable {
  private images: Record<ImageId, MediaInfo> = {};

  hasImageId(imageId: ImageId): boolean {
    return !!this.images[imageId];
  }

  getMedia(imageId: ImageId): MediaInfo {
    return this.images[imageId];
  }

  async drawImage(
    imageId: ImageId,
    drawProcedure: (context: OffscreenCanvasRenderingContext2D) => void,
  ): Promise<MediaInfo> {
    const canvas = new OffscreenCanvas(1, 1);
    drawProcedure(canvas.getContext('2d')!);
    const imageInfo = new MediaInfo(canvas);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadCanvas(
    imageId: ImageId,
    canvas: HTMLCanvasElement,
  ): Promise<MediaInfo> {
    const imageInfo = new MediaInfo(canvas);
    canvas.getContext('2d');
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadImage(imageId: ImageId, src: Url): Promise<MediaInfo> {
    const imageInfo = await MediaInfo.loadImage(src);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadVideo(
    imageId: ImageId,
    src: Url,
    volume: number | undefined,
  ): Promise<MediaInfo> {
    const videoInfo = await MediaInfo.loadVideo(src, volume);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }

  async loadWebCam(
    imageId: ImageId,
    deviceId: string | undefined,
  ): Promise<MediaInfo> {
    const videoInfo = await MediaInfo.loadWebcam(deviceId);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }
}
