import { Refresh } from 'updates/Refresh';
import { Disposable } from '../../lifecycle/Disposable';
import { Schedule } from 'core/motor/Motor';

export class MediaData extends Disposable implements Refresh {
  readonly texImgSrc: TexImageSource;
  active: boolean = false;
  readonly width: number;
  readonly height: number;
  readonly isVideo: boolean;
  refreshCallback?(): void;
  schedule?: Partial<Schedule>;

  constructor(image: TexImageSource, refreshRate?: number) {
    super();
    this.texImgSrc = image;
    const img: any = image;
    this.isVideo = !!(img.videoWidth || img.videoHeight);
    this.width = img.naturalWidth ?? img.videoWidth ?? img.displayWidth ?? img.width?.baseValue?.value ?? img.width;
    this.height = img.naturalHeight ?? img.videoHeight ?? img.displayHeight ?? img.height?.baseValue?.value ?? img.height;
    this.schedule = refreshRate ? { period: 1000 / refreshRate } : undefined;
    if (!this.width || !this.height) {
      throw new Error('Invalid image');
    }
  }

  refresh(): void {
    this.refreshCallback?.();
  }

  static createFromCanvas(canvas: OffscreenCanvas | HTMLCanvasElement): MediaData {
    return new MediaData(canvas);
  }

  static async loadImage(src: string): Promise<MediaData> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      const imageError = (e: ErrorEvent) => reject(e.error);
      image.addEventListener('error', imageError);
      image.addEventListener('load', () => resolve(image), { once: true });
      image.src = src;
    });
    return new MediaData(image);
  }

  static async loadVideo(src: string, volume?: number, fps: number = 30, playSpeed: number = 1, maxRefreshRate: number = Number.MAX_SAFE_INTEGER): Promise<MediaData> {
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
    const videoInfo = new MediaData(video, Math.min(fps * playSpeed, maxRefreshRate));
    videoInfo.addOnDestroy(() => video.pause());
    return videoInfo;
  }

  static async loadWebcam(deviceId?: string): Promise<MediaData> {
    const video = await new Promise<HTMLVideoElement>((resolve, reject) => {
      const video = document.createElement('video');
      video.loop = true;

      video.addEventListener('loadedmetadata', () => video.play());
      video.addEventListener('playing', () => resolve(video), { once: true });
      video.addEventListener('error', (e: ErrorEvent) => reject(e.error));
    });
    const videoInfo = new MediaData(video);
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
