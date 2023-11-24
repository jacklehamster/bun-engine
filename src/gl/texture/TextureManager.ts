import { Disposable } from '../../disposable/Disposable';
import { GL } from '../attributes/Contants';
import { MediaInfo } from './MediaInfo';
import { Slot, TextureIndex } from "texture-slot-allocator/dist/src/texture/TextureSlot";

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

  /**
   * Assign a media to a texture slot
   * @param mediaInfo Image or video
   * @param slot texture slot
   * @param generateMipMap if true, generate the mip map
   * @returns null or a callback to refresh the texture. Mainly used to refresh videos on texture
   */
  applyImageToSlot(mediaInfo: MediaInfo, slot: Slot, generateMipMap: boolean = false): (() => void) | null {
    const textureId: TextureId = `TEXTURE${slot.textureIndex}`;
    const webGLTexture = this.getTexture(textureId);
    if (!webGLTexture) {
      console.warn(`Invalid texture Id ${textureId}`);
      return null;
    }

    const refreshCallback = this.assignImageToTexture(
      mediaInfo,
      textureId,
      webGLTexture,
      [0, 0, mediaInfo.width, mediaInfo.height],
      [slot.x, slot.y, ...slot.size],
    );
    if (generateMipMap) {
      this.generateMipMap(textureId);
    }
    return refreshCallback;
  }

  private assignImageToTexture(
    imageInfo: MediaInfo,
    textureId: TextureId,
    texture: WebGLTexture,
    sourceRect?: [number, number, number, number],
    destRect?: [number, number, number, number],
  ): (() => void) | null {
    if (imageInfo) {
      const srcRect = sourceRect ?? [0, 0, imageInfo.width, imageInfo.height];
      const dstRect = destRect ?? [0, 0, srcRect[2], srcRect[3]];
      if (imageInfo.active) {
        const refreshTexture = () => {
          this.gl.bindTexture(GL.TEXTURE_2D, texture);
          this.applyTexImage2d(imageInfo, srcRect, dstRect);
        };
        refreshTexture();
        return refreshTexture;
      } else {
        this.loadTexture(imageInfo, textureId, texture, srcRect, dstRect);
        imageInfo.active = true;
      }
    }
    return null;
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
