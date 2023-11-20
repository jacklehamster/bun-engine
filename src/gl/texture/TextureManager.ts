import { Disposable } from '../../disposable/Disposable';
import { GL } from '../attributes/Contants';
import { MediaInfo } from './MediaInfo';

export type TextureIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;

type TextureId = `TEXTURE${TextureIndex}`;

export type Url = string;
export type ImageId = string;

const MAX_TEXTURE_SIZE = 4096;

export class TextureManager extends Disposable {
  private gl: GL;
  private textureBuffers: Record<TextureId | string, WebGLTexture> = {};
  private tempCanvas = new OffscreenCanvas(1, 1);
  private tempContext = this.tempCanvas.getContext('2d')!;

  constructor(gl: GL) {
    super();
    this.gl = gl;
    this.tempContext.imageSmoothingEnabled = true;
  }

  private getTexture(textureId: TextureId) {
    if (!this.textureBuffers[textureId]) {
      const texture = this.gl.createTexture();
      if (!texture) {
        return;
      }
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.gl.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.RGBA,
        MAX_TEXTURE_SIZE,
        MAX_TEXTURE_SIZE,
        0,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        null,
      );

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
    destRect: [number, number, number, number],
  ): void {
    this.gl.activeTexture(GL[textureId]);
    this.gl.bindTexture(GL.TEXTURE_2D, texture);
    this.applyTexImage2d(mediaInfo, sourceRect, destRect);
    this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
  }

  applyTexImage2d(
    mediaInfo: MediaInfo,
    [srcX, srcY, srcWidth, srcHeight]: number[],
    [dstX, dstY, dstWidth, dstHeight]: number[],
  ): void {
    if (srcWidth === dstWidth && srcHeight === dstHeight && !srcX && !srcY) {
      this.gl.texSubImage2D(
        GL.TEXTURE_2D,
        0,
        dstX,
        dstY,
        srcWidth,
        srcHeight,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        mediaInfo.texImgSrc,
      );
    } else {
      console.log('Used canvas');
      const canvas = this.tempContext.canvas;
      if (mediaInfo.texImgSrc instanceof ImageData) {
        canvas.width = dstWidth || mediaInfo.width;
        canvas.height = dstHeight || mediaInfo.height;
        this.tempContext.putImageData(mediaInfo.texImgSrc, 0, 0);
        if (srcX || srcY) {
          console.warn('Offset not available when sending imageData');
        }
      } else {
        const sourceWidth = srcWidth || mediaInfo.width;
        const sourceHeight = srcHeight || mediaInfo.height;
        canvas.width = dstWidth || sourceWidth;
        canvas.height = dstHeight || sourceHeight;
        this.tempContext.drawImage(
          mediaInfo.texImgSrc,
          srcX,
          srcY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }
      this.gl.texSubImage2D(
        GL.TEXTURE_2D,
        0,
        dstX,
        dstY,
        canvas.width,
        canvas.height,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        canvas,
      );
    }
  }

  assignImageToTexture(
    imageInfo: MediaInfo,
    textureId: TextureId,
    sourceRect?: [number, number, number, number],
    destRect?: [number, number, number, number],
  ): void {
    if (!this.getTexture(textureId)) {
      console.warn('Invalid texture Id');
      return;
    }
    if (imageInfo) {
      const texture = this.getTexture(textureId);
      if (texture) {
        const srcRect = sourceRect ?? [0, 0, imageInfo.width, imageInfo.height];
        const dstRect = destRect ?? [0, 0, srcRect[2], srcRect[3]];
        if (imageInfo.active) {
          this.gl.bindTexture(GL.TEXTURE_2D, texture);
          this.applyTexImage2d(imageInfo, srcRect, dstRect);
        } else {
          this.loadTexture(imageInfo, textureId, texture, srcRect, dstRect);
          imageInfo.active = true;
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

      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
      this.gl.generateMipmap(GL.TEXTURE_2D);
      console.log('GENERATED MIPMAP');
    }
  }
}
