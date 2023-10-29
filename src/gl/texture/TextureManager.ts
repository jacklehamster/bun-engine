import { Disposable } from "../../disposable/Disposable";
import { GL } from "../attributes/Contants";
import { MediaInfo } from "./MediaInfo";

export type TextureId = "TEXTURE0"|"TEXTURE1"|"TEXTURE2"|"TEXTURE3"|"TEXTURE4"|"TEXTURE5"|"TEXTURE6"|"TEXTURE7"|"TEXTURE8"|"TEXTURE9"
|"TEXTURE10"|"TEXTURE11"|"TEXTURE12"|"TEXTURE13"|"TEXTURE14"|"TEXTURE15"|"TEXTURE16"|"TEXTURE17"|"TEXTURE18"|"TEXTURE19"
|"TEXTURE20"|"TEXTURE21"|"TEXTURE22"|"TEXTURE23"|"TEXTURE24"|"TEXTURE25"|"TEXTURE26"|"TEXTURE27"|"TEXTURE28"|"TEXTURE29"
|"TEXTURE30"|"TEXTURE31";

export type Url = string;
export type ImageId = string;

const MAX_TEXTURE_SIZE = 4096;
const DEBUG = false;


export class TextureManager extends Disposable {
    private gl: GL;
    private textureBuffers: Record<TextureId | string, WebGLTexture> = {};
    private images: Record<ImageId, MediaInfo> = {};
    private tempCanvas = document.createElement("canvas");
    private tempContext = this.tempCanvas.getContext("2d")!;

    constructor(gl: GL) {
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
            this.gl.bindTexture(GL.TEXTURE_2D, texture);
            this.gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
            this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
			this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			            
            this.textureBuffers[textureId] = texture;
            this.addOnDestroy(() => this.gl.deleteTexture(texture));
        }
        return this.textureBuffers[textureId];
    }

    private loadTexture(
            mediaInfo: MediaInfo,
            textureId: TextureId,
            texture: WebGLTexture,
            sourceRect: [number, number, number, number],
            destRect: [number, number, number, number]): void {
        this.gl.activeTexture(GL[textureId]);
        this.gl.bindTexture(GL.TEXTURE_2D, texture);
        this.applyTexImage2d(mediaInfo, sourceRect, destRect);
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    }

    private applyTexImage2d(
            mediaInfo: MediaInfo,
            [srcX, srcY, srcWidth, srcHeight]: number[],
            [dstX, dstY, dstWidth, dstHeight]: number[]): void {
        const canvas = this.tempContext.canvas;
        if (mediaInfo.texImgSrc instanceof ImageData) {
            canvas.width = dstWidth || mediaInfo.width;
            canvas.height = dstHeight || mediaInfo.height;
            this.tempContext.putImageData(mediaInfo.texImgSrc, 0, 0);
            if (srcX || srcY) {
                console.warn("Offset not available when sending imageData");
            }
        } else {
            const sourceWidth = srcWidth || mediaInfo.width;
            const sourceHeight = srcHeight || mediaInfo.height;
            canvas.width = dstWidth || sourceWidth;
            canvas.height = dstHeight || sourceHeight;
            this.tempContext.drawImage(mediaInfo.texImgSrc, srcX, srcY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        }
        this.gl.texSubImage2D(GL.TEXTURE_2D, 0, dstX, dstY, canvas.width, canvas.height, GL.RGBA, GL.UNSIGNED_BYTE, canvas);
    }

    hasImageId(imageId: ImageId): boolean {
        return !!this.images[imageId];
    }

    async loadCanvas(imageId: ImageId, canvas: HTMLCanvasElement): Promise<MediaInfo> {
        const imageInfo = new MediaInfo(canvas);
        this.images[imageId] = this.own(imageInfo);
        return imageInfo;
    }

    async loadImage(imageId: ImageId, src: Url): Promise<MediaInfo> {
        const imageInfo = await MediaInfo.loadImage(src);
        this.images[imageId] = this.own(imageInfo);
        return imageInfo;
    }

    async loadVideo(imageId: ImageId, src: Url, volume: number | undefined): Promise<MediaInfo> {
        const videoInfo = await MediaInfo.loadVideo(src, volume);
        this.images[imageId] = this.own(videoInfo);
        return videoInfo;
    }

    async loadWebCam(imageId: ImageId, deviceId: string | undefined): Promise<MediaInfo> {
        const videoInfo = await MediaInfo.loadWebcam(deviceId);
        this.images[imageId] = this.own(videoInfo);
        return videoInfo;
    }

    assignImageToTexture(
            imageId: ImageId,
            textureId: TextureId, 
            sourceRect?: [number, number, number, number],
            destRect?: [number, number, number, number]): void {
        if (!this.getTexture(textureId)) {
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
                    this.gl.bindTexture(GL.TEXTURE_2D, texture);
                    this.applyTexImage2d(imageInfo, srcRect, dstRect);
                } else {
                    this.loadTexture(imageInfo, textureId, texture, srcRect, dstRect);
                    imageInfo.activated = true;
                }    
            } else {
                console.warn(`Texture not found: ${textureId}`);
            }
        }
    }

    generateMipMap(textureId: TextureId) {
        const texture = this.getTexture(textureId);
        if (texture) {
            this.gl.activeTexture(GL[textureId]);
            this.gl.bindTexture(GL.TEXTURE_2D, texture);
            this.gl.generateMipmap(GL.TEXTURE_2D);
            console.log("GENERATED MIPMAP");
        }
	}
}
