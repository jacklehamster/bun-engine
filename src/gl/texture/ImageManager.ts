import { Disposable } from "gl/lifecycle/Disposable";
import { Url } from "./TextureManager";
import { MediaData } from "./MediaData";
import { CanvasMedia, DrawMedia, ImageMedia, Media, MediaType, VideoMedia, WebcamMedia } from "./Media";

export type MediaId = number;

type DrawProcedure<T extends Media> = (imageId: MediaId, media: T) => Promise<MediaData>;

function createDrawProcedure<T extends Media>(procedure: DrawProcedure<T>): DrawProcedure<T> {
  return procedure;
}

export class ImageManager extends Disposable {
  private images: Record<MediaId, MediaData> = {};
  private readonly renderProcedures: Record<MediaType, DrawProcedure<Media>> = {
    image: createDrawProcedure<ImageMedia>((imageId, media) => this.loadImage(imageId, media.src)) as DrawProcedure<Media>,
    video: createDrawProcedure<VideoMedia>((imageId, media) => this.loadVideo(imageId, media.src, media.volume, media.fps, media.playSpeed)) as DrawProcedure<Media>,
    draw: createDrawProcedure<DrawMedia>((imageId, media) => this.drawImage(imageId, media.draw)) as DrawProcedure<Media>,
    canvas: createDrawProcedure<CanvasMedia>((imageId, media) => this.loadCanvas(imageId, media.canvas)) as DrawProcedure<Media>,
    webcam: createDrawProcedure<WebcamMedia>((imageId, media) => this.loadWebCam(imageId, media.deviceId)) as DrawProcedure<Media>,
  };

  private async postProcess(mediaData: MediaData, postProcessing: (canvas: OffscreenCanvas) => Promise<OffscreenCanvas> | OffscreenCanvas | void) {
    if (mediaData.canvasImgSrc) {
      const canvas = new OffscreenCanvas(mediaData.width, mediaData.height);
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(mediaData.canvasImgSrc, 0, 0);
      return MediaData.createFromCanvas(await postProcessing(canvas) ?? canvas);
    }
    return mediaData;
  }

  hasImageId(imageId: MediaId): boolean {
    return !!this.getMedia(imageId);
  }


  getMedia(imageId: MediaId): MediaData {
    return this.images[imageId];
  }

  setImage(imageId: MediaId, mediaInfo: MediaData): void {
    this.images[imageId] = mediaInfo;
  }

  async renderMedia(imageId: MediaId, media: Media): Promise<MediaData> {
    const mediaData = await this.renderProcedures[media.type](imageId, media);
    const { postProcessing } = media;
    return postProcessing ? this.postProcess(mediaData, postProcessing) : mediaData;
  }

  async drawImage(
    imageId: MediaId,
    drawProcedure: (context: OffscreenCanvasRenderingContext2D) => void,
  ): Promise<MediaData> {
    const canvas = new OffscreenCanvas(1, 1);
    drawProcedure(canvas.getContext('2d')!);
    const imageInfo = MediaData.createFromCanvas(canvas);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadCanvas(
    imageId: MediaId,
    canvas: HTMLCanvasElement | OffscreenCanvas,
  ): Promise<MediaData> {
    const imageInfo = MediaData.createFromCanvas(canvas);
    canvas.getContext('2d');
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadImage(imageId: MediaId, src: Url): Promise<MediaData> {
    const imageInfo = await MediaData.loadImage(src);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }

  async loadVideo(
    imageId: MediaId,
    src: Url,
    volume?: number,
    fps?: number,
    playSpeed?: number,
    maxRefreshRate?: number,
  ): Promise<MediaData> {
    const videoInfo = await MediaData.loadVideo(src, volume, fps, playSpeed, maxRefreshRate);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }

  async loadWebCam(
    imageId: MediaId,
    deviceId: string | undefined,
  ): Promise<MediaData> {
    const videoInfo = await MediaData.loadWebcam(deviceId);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }
}
