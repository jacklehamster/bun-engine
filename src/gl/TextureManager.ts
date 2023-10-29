import { Disposable } from "../disposable/Disposable";

export type TextureId = "TEXTURE0"|"TEXTURE1"|"TEXTURE2"|"TEXTURE3"|"TEXTURE4"|"TEXTURE5"|"TEXTURE6"|"TEXTURE7"|"TEXTURE8"|"TEXTURE9"
|"TEXTURE10"|"TEXTURE11"|"TEXTURE12"|"TEXTURE13"|"TEXTURE14"|"TEXTURE15"|"TEXTURE16"|"TEXTURE17"|"TEXTURE18"|"TEXTURE19"
|"TEXTURE20"|"TEXTURE21"|"TEXTURE22"|"TEXTURE23"|"TEXTURE24"|"TEXTURE25"|"TEXTURE26"|"TEXTURE27"|"TEXTURE28"|"TEXTURE29"
|"TEXTURE30"|"TEXTURE31";

export type Url = string;
export type ImageId = string;

const MAX_TEXTURE_SIZE = 4096;
const DEBUG = false;

class MediaInfo extends Disposable {
    texImgSrc: TexImageSource;
    activated: boolean = false;
    width: number;
    height: number;

    constructor(image: TexImageSource) {
        super();
        this.texImgSrc = image;
        this.width = image instanceof HTMLImageElement ? image.naturalWidth
            : image instanceof VideoFrame ? image.displayWidth
            : image.width;
        this.height = image instanceof HTMLImageElement ? image.naturalHeight
            : image instanceof VideoFrame ? image.displayHeight
            : image.width;
    }

    static async loadImage(src: string): Promise<MediaInfo> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const imageInfo = new MediaInfo(image);
            const imageLoaded = () => resolve(imageInfo);
            const imageError = (e: ErrorEvent) => reject(e.error);
            image.addEventListener("error", imageError);
            image.addEventListener("load", imageLoaded, { once: true });
            imageInfo.addOnDestroy(() => image.removeEventListener("load", imageLoaded));
            image.src = src;
        });
    }

    static async loadVideo(src: string, volume?: number): Promise<MediaInfo> {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            const videoInfo = new MediaInfo(video);
            video.loop = true;
            if (volume !== undefined) {
                video.volume = volume;
            }
            const startVideo = () => video.play();
            const onVideoPlaying = () => resolve(videoInfo);
    
            video.addEventListener("loadedmetadata", startVideo);
            video.addEventListener("playing", onVideoPlaying, { once: true });
            video.addEventListener("error", (e: ErrorEvent) => reject(e.error));
            video.src = src;

            videoInfo.addOnDestroy(() => {
                video.pause();
                video.removeEventListener("playing", onVideoPlaying);
                video.removeEventListener("loadmetadata", startVideo);                
            });
        });      
    }

    static async loadWebcam(deviceId?: string): Promise<MediaInfo> {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            const videoInfo = new MediaInfo(video);
            video.loop = true;
            const startVideo = () => video.play();
            const onVideoPlaying = () => resolve(videoInfo);
    
            video.addEventListener("loadedmetadata", startVideo);
            video.addEventListener("playing", onVideoPlaying, { once: true });
            video.addEventListener("error", (e: ErrorEvent) => reject(e.error));
            let cancelled = false;
            navigator.mediaDevices.getUserMedia({ video: { deviceId } }).then(stream => {
                if (!cancelled) {
                    video.srcObject = stream;
                    videoInfo.addOnDestroy(() => stream.getTracks().forEach(track => track.stop()));
                }
            });

            videoInfo.addOnDestroy(() => {
                cancelled = true;
                video.pause();
                video.removeEventListener("playing", onVideoPlaying);
                video.removeEventListener("loadmetadata", startVideo);                
            });
        });      
    }
}

export class TextureManager extends Disposable {
    private gl: WebGL2RenderingContext;
    private textureBuffers: Record<TextureId | string, WebGLTexture> = {};
    private images: Record<ImageId, MediaInfo> = {};
    private tempCanvas = document.createElement("canvas");
    private tempContext = this.tempCanvas.getContext("2d")!;

    constructor(gl: WebGL2RenderingContext) {
        super();
        this.gl = gl;
        this.tempContext.imageSmoothingEnabled = true;
        if (DEBUG) {
            this.tempCanvas.style.width = "400px";
            this.tempCanvas.style.height = "400px";
            document.body.appendChild(this.tempCanvas);
        }
    }

    private getTexture(textureId: TextureId) {
        if (!this.textureBuffers[textureId]) {
            const texture = this.gl.createTexture();
            if (!texture) {
                return;
            }
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
            this.textureBuffers[textureId] = texture;
            this.addOnDestroy(() => this.gl.deleteTexture(texture));
        }
        return this.textureBuffers[textureId];
    }

    private loadTexture(
            source: TexImageSource,
            textureId: TextureId,
            texture: WebGLTexture,
            sourceRect: [number, number, number, number],
            destRect: [number, number, number, number]): void {
        this.gl.activeTexture(this.gl[textureId]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.applyTexImage2d(source, sourceRect, destRect);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }

    private applyTexImage2d(
            source: TexImageSource,
            [srcX, srcY, srcWidth, srcHeight]: number[],
            [dstX, dstY, dstWidth, dstHeight]: number[]): void {
        if (!srcWidth && !srcHeight && !dstWidth && !dstHeight) {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        } else {
            const canvas = this.tempContext.canvas;
            if (source instanceof ImageData) {
                canvas.width = dstWidth || source.width;
                canvas.height = dstHeight || source.height;
                this.tempContext.putImageData(source, 0, 0);
                if (srcX || srcY) {
                    console.warn("Offset not available when sending imageData");
                }
            } else {
                const sourceWidth = srcWidth || (source as {width:number}).width;
                const sourceHeight = srcHeight || (source as {height:number}).height;
                canvas.width = dstWidth || sourceWidth;
                canvas.height = dstHeight || sourceHeight;
                this.tempContext.drawImage(source, srcX, srcY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
            }
            this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, dstX, dstY, canvas.width, canvas.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        }
    }

    hasImageId(imageId: ImageId): boolean {
        return !!this.images[imageId];
    }

    loadCanvas(canvas: HTMLCanvasElement, imageId: ImageId): MediaInfo {
        const imageInfo = new MediaInfo(canvas);
        this.images[imageId] = this.own(imageInfo);
        return imageInfo;
    }

    async loadImage(src: Url, imageId: ImageId): Promise<MediaInfo> {
        const imageInfo = await MediaInfo.loadImage(src);
        this.images[imageId] = this.own(imageInfo);
        return imageInfo;
    }

    async loadVideo(src: Url, imageId: ImageId, volume: number | undefined): Promise<MediaInfo> {
        const videoInfo = await MediaInfo.loadVideo(src, volume);
        this.images[imageId] = this.own(videoInfo);
        return videoInfo;
    }

    async loadWebCam(deviceId: string | undefined, imageId: ImageId): Promise<MediaInfo> {
        const videoInfo = await MediaInfo.loadWebcam(deviceId);
        this.images[imageId] = this.own(videoInfo);
        return videoInfo;
    }

    assignImageToTexture(
            imageId: ImageId,
            textureId: TextureId | undefined, 
            sourceRect?: [number, number, number, number],
            destRect?: [number, number, number, number]): void {
        if (!textureId) {
            console.warn("Invalid texture Id");
            return;
        }
        const imageInfo = this.images[imageId];
        if (imageInfo) {
            const texture = this.getTexture(textureId);
            if (texture) {
                const srcRect = sourceRect ?? [0, 0, imageInfo.width, imageInfo.height];
                const dstRect = destRect ?? [0, 0, srcRect[2], srcRect[3]];
                if (imageInfo.activated) {
                    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                    this.applyTexImage2d(imageInfo.texImgSrc, srcRect, dstRect);
                } else {
                    this.loadTexture(imageInfo.texImgSrc, textureId, texture, srcRect, dstRect);
                    imageInfo.activated = true;
                }    
            }
        }
    }
}
