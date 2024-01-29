import { Refresh } from 'motor-loop';
import { Disposable } from '../lifecycle/Disposable';
import { MediaId } from './ImageManager';

export class MediaData extends Disposable implements Refresh {
  readonly width: number;
  readonly height: number;
  readonly isVideo: boolean;
  refreshCallback?(): void;

  constructor(
    readonly id: MediaId,
    readonly texImgSrc: TexImageSource,
    readonly refreshRate?: number,
    readonly canvasImgSrc?: CanvasImageSource
  ) {
    super();
    const img: any = texImgSrc;
    this.isVideo = !!(img.videoWidth || img.videoHeight);
    this.width = img.naturalWidth ?? img.videoWidth ?? img.displayWidth ?? img.width?.baseValue?.value ?? img.width;
    this.height = img.naturalHeight ?? img.videoHeight ?? img.displayHeight ?? img.height?.baseValue?.value ?? img.height;
    this.canvasImgSrc = canvasImgSrc;
    if (!this.width || !this.height) {
      throw new Error('Invalid image');
    }
  }

  refresh(): void {
    this.refreshCallback?.();
  }

  static createFromCanvas(mediaId: MediaId, canvas: OffscreenCanvas | HTMLCanvasElement): MediaData {
    return new MediaData(mediaId, canvas);
  }

  static async loadImage(mediaID: MediaId, src: string): Promise<MediaData> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      const imageError = (e: ErrorEvent) => reject(e.error);
      image.addEventListener('error', imageError);
      image.addEventListener('load', () => resolve(image), { once: true });
      image.src = src;
    });

    return new MediaData(mediaID, image, undefined, image);
  }

  static async loadVideo(mediaId: MediaId, src: string, volume?: number, fps: number = 30, playSpeed: number = 1, maxRefreshRate: number = Number.MAX_SAFE_INTEGER): Promise<MediaData> {
    const video = await new Promise<HTMLVideoElement>((resolve, reject) => {
      const video = document.createElement('video');
      video.loop = true;
      if (volume !== undefined) {
        video.volume = volume;
      }

      video.addEventListener('loadedmetadata', () => {
        video.play();
        video.playbackRate = playSpeed;
        resolve(video);
      }, { once: true });
      document.addEventListener('focus', () => video.play());
      video.addEventListener('error', (e: ErrorEvent) => reject(e.error));
      video.src = src;

    });
    const videoInfo = new MediaData(mediaId, video, Math.min(fps * playSpeed, maxRefreshRate));
    videoInfo.addOnDestroy(() => video.pause());
    return videoInfo;
  }

  static async loadWebcam(mediaId: MediaId, deviceId?: string): Promise<MediaData> {
    const video = await new Promise<HTMLVideoElement>((resolve, reject) => {
      const video = document.createElement('video');
      video.loop = true;

      video.addEventListener('loadedmetadata', () => video.play());
      video.addEventListener('playing', () => resolve(video), { once: true });
      video.addEventListener('error', (e: ErrorEvent) => reject(e.error));
    });
    const videoInfo = new MediaData(mediaId, video);
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId } })
      .then((stream) => {
        if (!cancelled) {
          video.srcObject = stream;
          videoInfo.addOnDestroy(() =>
            stream.getTracks().forEach((track) => track.stop()),
          );
        }
      });

    videoInfo.addOnDestroy(() => {
      cancelled = true;
      video.pause();
    });
    return videoInfo;
  }
}
