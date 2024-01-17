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
  private readonly renderProcedures: Record<MediaType, DrawProcedure<Media>> = {
    image: createDrawProcedure<ImageMedia>((imageId, media) => this.loadImage(imageId, media.src)) as DrawProcedure<Media>,
    video: createDrawProcedure<VideoMedia>((imageId, media) => this.loadVideo(imageId, media.src, media.volume, media.fps, media.playSpeed)) as DrawProcedure<Media>,
    draw: createDrawProcedure<DrawMedia>((imageId, media) => this.drawImage(imageId, media.draw)) as DrawProcedure<Media>,
    canvas: createDrawProcedure<CanvasMedia>((imageId, media) => this.loadCanvas(imageId, media.canvas)) as DrawProcedure<Media>,
    webcam: createDrawProcedure<WebcamMedia>((imageId, media) => this.loadWebCam(imageId, media.deviceId)) as DrawProcedure<Media>,
  };

  private async postProcess(mediaData: MediaData, postProcessing: (context: OffscreenCanvasRenderingContext2D) => Promise<void>) {
    if (mediaData.canvasImgSrc) {
      const canvas = new OffscreenCanvas(mediaData.width, mediaData.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(mediaData.canvasImgSrc, 0, 0);
        await postProcessing(ctx);
      }
      return MediaData.createFromCanvas(mediaData.id, canvas);
    }
    return mediaData;
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
    const imageInfo = MediaData.createFromCanvas(imageId, canvas);
    return imageInfo;
  }

  async loadCanvas(
    imageId: MediaId,
    canvas: HTMLCanvasElement | OffscreenCanvas,
  ): Promise<MediaData> {
    const imageInfo = MediaData.createFromCanvas(imageId, canvas);
    canvas.getContext('2d');
    return imageInfo;
  }

  async loadImage(imageId: MediaId, src: Url): Promise<MediaData> {
    const imageInfo = await MediaData.loadImage(imageId, src);
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
    const videoInfo = await MediaData.loadVideo(imageId, src, volume, fps, playSpeed, maxRefreshRate);
    return videoInfo;
  }

  async loadWebCam(
    imageId: MediaId,
    deviceId: string | undefined,
  ): Promise<MediaData> {
    const videoInfo = await MediaData.loadWebcam(imageId, deviceId);
    return videoInfo;
  }
}
