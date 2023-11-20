import { Disposable } from '../../disposable/Disposable';

export class MediaInfo extends Disposable {
  readonly texImgSrc: TexImageSource;
  active: boolean = false;
  readonly width: number;
  readonly height: number;

  private constructor(image: TexImageSource) {
    super();
    this.texImgSrc = image;
    this.width =
      image instanceof HTMLImageElement
        ? image.naturalWidth
        : image instanceof VideoFrame
          ? image.displayWidth
          : image.width;
    this.height =
      image instanceof HTMLImageElement
        ? image.naturalHeight
        : image instanceof VideoFrame
          ? image.displayHeight
          : image.width;
    if (!this.width || !this.height) {
      throw new Error('Invalid image');
    }
  }

  static createFromCanvas(canvas: OffscreenCanvas | HTMLCanvasElement): MediaInfo {
    return new MediaInfo(canvas);
  }

  static async loadImage(src: string): Promise<MediaInfo> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const imageInfo = new MediaInfo(image);
      const imageLoaded = () => resolve(imageInfo);
      const imageError = (e: ErrorEvent) => reject(e.error);
      image.addEventListener('error', imageError);
      image.addEventListener('load', imageLoaded, { once: true });
      imageInfo.addOnDestroy(() =>
        image.removeEventListener('load', imageLoaded),
      );
      image.src = src;
    });
  }

  static async loadVideo(src: string, volume?: number): Promise<MediaInfo> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const videoInfo = new MediaInfo(video);
      video.loop = true;
      if (volume !== undefined) {
        video.volume = volume;
      }
      const startVideo = () => video.play();
      const onVideoPlaying = () => resolve(videoInfo);

      video.addEventListener('loadedmetadata', startVideo);
      video.addEventListener('playing', onVideoPlaying, { once: true });
      video.addEventListener('error', (e: ErrorEvent) => reject(e.error));
      video.src = src;

      videoInfo.addOnDestroy(() => {
        video.pause();
        video.removeEventListener('playing', onVideoPlaying);
        video.removeEventListener('loadmetadata', startVideo);
      });
    });
  }

  static async loadWebcam(deviceId?: string): Promise<MediaInfo> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const videoInfo = new MediaInfo(video);
      video.loop = true;
      const startVideo = () => video.play();
      const onVideoPlaying = () => resolve(videoInfo);

      video.addEventListener('loadedmetadata', startVideo);
      video.addEventListener('playing', onVideoPlaying, { once: true });
      video.addEventListener('error', (e: ErrorEvent) => reject(e.error));
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
        video.removeEventListener('playing', onVideoPlaying);
        video.removeEventListener('loadmetadata', startVideo);
      });
    });
  }
}
