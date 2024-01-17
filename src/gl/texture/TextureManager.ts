import { GLUniforms } from 'gl/uniforms/GLUniforms';
import { Disposable } from '../lifecycle/Disposable';
import { GL, MAX_TEXTURE_SIZE_LOC, TEXTURE_UNIFORM_LOC } from '../attributes/Constants';
import { MediaData } from './MediaData';
import { Slot, TextureIndex } from "texture-slot-allocator/dist/src/texture/TextureSlot";
import { TextureSlotAllocator } from 'texture-slot-allocator/dist/src/texture/TextureSlotAllocator';

export type TextureId = `TEXTURE${TextureIndex}`;
export const TEXTURE_INDEX_FOR_VIDEO = 15;

export type Url = string;

export class TextureManager extends Disposable {
  private gl: GL;
  private uniforms: GLUniforms;
  private textureBuffers: Record<TextureId | string, WebGLTexture> = {};
  private tempContext = (new OffscreenCanvas(1, 1)).getContext('2d')!;
  private textureSlotAllocator = new TextureSlotAllocator({
    excludeTexture: (tex) => tex === TEXTURE_INDEX_FOR_VIDEO
  });
  private textureSlotAllocatorForVideo = new TextureSlotAllocator({
    excludeTexture: (tex) => tex !== TEXTURE_INDEX_FOR_VIDEO
  });
  private activeMedias: Set<MediaData> = new Set();

  constructor(gl: GL, uniforms: GLUniforms) {
    super();
    this.gl = gl;
    this.uniforms = uniforms;
    this.tempContext.imageSmoothingEnabled = true;
  }

  initialize() {
    this.initTextureUniforms();
    this.initMaxTexture();
  }

  private getTexture(textureId: TextureId) {
    if (!this.textureBuffers[textureId]) {
      const texture = this.gl.createTexture();
      if (!texture) {
        return;
      }
      this.textureBuffers[textureId] = texture;
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.gl.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.RGBA,
        this.textureSlotAllocator.maxTextureSize,
        this.textureSlotAllocator.maxTextureSize,
        0,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        null,
      );
      this.generateMipMap(textureId);

      this.addOnDestroy(() => this.gl.deleteTexture(texture));
    }
    return this.textureBuffers[textureId];
  }

  private loadTexture(
    mediaInfo: MediaData,
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
    mediaInfo: MediaData,
    [srcX, srcY, srcWidth, srcHeight]: number[],
    [dstX, dstY, dstWidth, dstHeight]: number[],
  ): void {
    if (srcWidth === dstWidth && srcHeight === dstHeight && !srcX && !srcY) {
      this.gl.texSubImage2D(
        GL.TEXTURE_2D,
        0,
        dstX,
        dstY,
        dstWidth,
        dstHeight,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        mediaInfo.texImgSrc,
      );
    } else {
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

  allocateSlotForImage(mediaInfo: MediaData): { slot: Slot, refreshCallback: () => void } {
    const allocator = mediaInfo.isVideo ? this.textureSlotAllocatorForVideo : this.textureSlotAllocator;
    const slot = allocator.allocate(mediaInfo.width, mediaInfo.height);
    const textureId: TextureId = `TEXTURE${slot.textureIndex}`;
    const webGLTexture = this.getTexture(textureId);
    if (!webGLTexture) {
      throw new Error(`Invalid texture Id ${textureId}`);
    }

    const refreshCallback = this.assignImageToTexture(
      mediaInfo,
      textureId,
      webGLTexture,
      [0, 0, mediaInfo.width, mediaInfo.height],
      [slot.x, slot.y, ...slot.size],
    );
    return { slot, refreshCallback };
  }

  private assignImageToTexture(
    imageInfo: MediaData,
    textureId: TextureId,
    texture: WebGLTexture,
    sourceRect?: [number, number, number, number],
    destRect?: [number, number, number, number],
  ): () => void {
    const srcRect = sourceRect ?? [0, 0, imageInfo.width, imageInfo.height];
    const dstRect = destRect ?? [0, 0, srcRect[2], srcRect[3]];
    const refreshTexture = () => {
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.applyTexImage2d(imageInfo, srcRect, dstRect);
    };

    if (this.activeMedias.has(imageInfo)) {
      refreshTexture();
    } else {
      this.loadTexture(imageInfo, textureId, texture, srcRect, dstRect);
      this.activeMedias.add(imageInfo);
    }
    return refreshTexture;
  }

  setupTextureForVideo(textureId: TextureId) {
    const texture = this.getTexture(textureId);
    if (texture) {
      this.gl.activeTexture(GL[textureId]);
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
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
    }
  }

  private initTextureUniforms() {
    const maxTextureUnits = this.gl.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);
    const arrayOfTextureIndex = new Array(maxTextureUnits).fill(null).map((_, index) => index);	//	0, 1, 2, 3... 16
    const textureUniformLocation = this.uniforms.getUniformLocation(TEXTURE_UNIFORM_LOC);
    this.gl.uniform1iv(textureUniformLocation, arrayOfTextureIndex);
  }

  private initMaxTexture() {
    const loc = this.uniforms.getUniformLocation(MAX_TEXTURE_SIZE_LOC);
    this.gl.uniform1f(loc, this.textureSlotAllocator.maxTextureSize);
  }
}
