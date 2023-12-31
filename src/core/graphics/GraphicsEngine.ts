// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { GLPrograms } from '../../gl/programs/GLPrograms';
import { Disposable } from '../../lifecycle/Disposable';
import { VertexArray } from '../../gl/VertexArray';
import { GLAttributeBuffers, LocationName } from '../../gl/attributes/GLAttributeBuffers';
import { GLUniforms } from '../../gl/uniforms/GLUniforms';
import {
  GL,
  POSITION_LOC,
  INDEX_LOC,
  TRANSFORM_LOC,
  SLOT_SIZE_LOC,
  CAM_POS_LOC,
  CAM_PROJECTION_LOC,
  INSTANCE_LOC,
  CAM_TILT_LOC,
  CAM_TURN_LOC,
  CAM_CURVATURE_LOC,
} from '../../gl/attributes/Constants';
import { TEXTURE_INDEX_FOR_VIDEO, TextureId, TextureManager } from '../../gl/texture/TextureManager';
import { MediaId, ImageManager } from 'gl/texture/ImageManager';
import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { replaceTilda } from 'gl/utils/replaceTilda';
import Matrix from 'gl/transform/Matrix';
import { CameraFloatType, CameraMatrixType } from 'gl/camera/Camera';
import { mat4 } from 'gl-matrix';
import { MediaData } from 'gl/texture/MediaData';
import { Media } from 'gl/texture/Media';
import { Sprite, SpriteId } from 'world/sprite/Sprite';
import { IGraphicsEngine } from './IGraphicsEngine';

const DEFAULT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: true,
  desynchronized: true,
  failIfMajorPerformanceCaveat: undefined,
  powerPreference: 'default',
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  stencil: false,
};

const VERTEX_COUNT = 6;

const LOG_GL = false;

function glProxy(gl: GL) {
  if (!LOG_GL) {
    return gl;
  }
  const proxy = new Proxy<GL>(gl, {
    get(target, prop) {
      const t = target as any;
      const result = t[prop];
      if (typeof result === 'function') {
        const f = (...params: any[]) => {
          const returnValue = result.apply(t, params);
          console.log(`gl.${String(prop)}(`, params, ') = ', returnValue);
          return returnValue;
        };
        return f;
      } else {
        console.log(`gl.${String(prop)} = `, result);
        return result;
      }
    },
  });
  return proxy;
}

export interface Props {
  attributes?: WebGLContextAttributes;
}

export class GraphicsEngine extends Disposable implements IGraphicsEngine {
  private gl: GL;
  private programs: GLPrograms;
  private attributeBuffers: GLAttributeBuffers;
  private uniforms: GLUniforms;
  private canvas: HTMLCanvasElement | OffscreenCanvas;

  private textureManager: TextureManager;
  private imageManager: ImageManager;

  private textureSlots: Record<MediaId, {
    buffer: Float32Array,
  }> = {};

  private onResize: Set<(w: number, h: number) => void> = new Set();
  private pixelListeners: Set<{ x: number; y: number; pixel: number }> = new Set();
  private spriteCount = 0;
  private cameraMatrixUniforms: Record<CameraMatrixType | any, WebGLUniformLocation> = {};
  private cameraFloatUniforms: Record<CameraFloatType | any, WebGLUniformLocation> = {};

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, {
    attributes,
  }: Props = {}) {
    super();
    const gl: WebGL2RenderingContext = canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })! as WebGL2RenderingContext;
    this.gl = glProxy(gl);
    this.canvas = canvas;

    this.programs = this.own(new GLPrograms(this.gl));
    this.uniforms = this.own(new GLUniforms(this.gl, this.programs));
    this.attributeBuffers = this.own(new GLAttributeBuffers(this.gl, this.programs));

    this.textureManager = new TextureManager(this.gl, this.uniforms);
    this.imageManager = new ImageManager();

    const onResize = this.checkCanvasSize.bind(this);
    window.addEventListener('resize', onResize);
    this.addOnDestroy(() => window.removeEventListener('resize', onResize));
    this.initialize();
  }

  addResizeListener(listener: (w: number, h: number) => void): () => void {
    listener(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.onResize.add(listener);
    return () => this.removeResizeListener(listener);
  }

  removeResizeListener(listener: (w: number, h: number) => void) {
    this.onResize.delete(listener);
  }

  clearTextureSlots(): void {
    for (let i in this.textureSlots) {
      delete this.textureSlots[i];
    }
  }

  checkCanvasSize() {
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = this.canvas.offsetWidth * 2;
      this.canvas.height = this.canvas.offsetHeight * 2;
    }
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.onResize.forEach(callback => callback(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight));
  }

  private initialize() {
    const PROGRAM_NAME = 'main';
    const replacementMap = {
      AUTHOR: 'Jack le hamster',
    };
    this.programs.addProgram(PROGRAM_NAME,
      replaceTilda(vertexShader, replacementMap),
      replaceTilda(fragmentShader, replacementMap),
    );

    this.programs.useProgram(PROGRAM_NAME);

    this.cameraMatrixUniforms[CameraMatrixType.PROJECTION] = this.uniforms.getUniformLocation(CAM_PROJECTION_LOC, PROGRAM_NAME);
    this.cameraMatrixUniforms[CameraMatrixType.POS] = this.uniforms.getUniformLocation(CAM_POS_LOC, PROGRAM_NAME);
    this.cameraMatrixUniforms[CameraMatrixType.TURN] = this.uniforms.getUniformLocation(CAM_TURN_LOC, PROGRAM_NAME);
    this.cameraMatrixUniforms[CameraMatrixType.TILT] = this.uniforms.getUniformLocation(CAM_TILT_LOC, PROGRAM_NAME);

    this.cameraFloatUniforms[CameraFloatType.CURVATURE] = this.uniforms.getUniformLocation(CAM_CURVATURE_LOC, PROGRAM_NAME);

    //  enable depth
    this.gl.enable(GL.DEPTH_TEST);
    this.gl.depthFunc(GL.LESS);
    this.gl.clearDepth(1.0);

    //  enable blend
    this.gl.enable(GL.BLEND);
    this.gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

    // disable face culling
    this.gl.disable(this.gl.CULL_FACE);

    // clear background color
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.textureManager.initialize();
    this.checkCanvasSize();
  }

  activate(): void {
    this.clearTextureSlots();
  }

  setMaxSpriteCount(spriteCount: number): void {
    this.initializeBuffers(spriteCount);
  }

  private onCleanupBuffers: Set<() => void> = new Set();
  initializeBuffers(maxSpriteCount: number) {
    this.onCleanupBuffers.forEach(cleanup => cleanup());
    this.onCleanupBuffers.clear();
    if (maxSpriteCount) {
      const cleanups = [
        this.initializeIndexBuffer(INDEX_LOC),
        this.initializePositionBuffer(POSITION_LOC),
        this.initializeTransformBuffer(TRANSFORM_LOC, maxSpriteCount),
        this.initializeSlotSizeBuffer(SLOT_SIZE_LOC, maxSpriteCount),
        this.initializeInstanceBuffer(INSTANCE_LOC, maxSpriteCount),
      ];
      cleanups.forEach(cleanup => this.onCleanupBuffers.add(cleanup));
    }
  }

  private initializeIndexBuffer(location: LocationName) {
    /*
        0  1
        3  2
    */
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, bufferInfo.buffer);
    this.gl.bufferData(GL.ELEMENT_ARRAY_BUFFER,
      Uint16Array.from([0, 1, 2, 2, 3, 0]),
      GL.STATIC_DRAW);
    return () => {
      this.attributeBuffers.deleteBuffer(location);
    };
  }

  private initializePositionBuffer(location: LocationName) {
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    this.gl.vertexAttribPointer(
      bufferInfo.location,
      2,
      GL.FLOAT,
      false,
      0,
      0,
    );
    this.gl.enableVertexAttribArray(bufferInfo.location);
    this.gl.bufferData(GL.ARRAY_BUFFER,
      Float32Array.from([-1, -1, 1, -1, 1, 1, -1, 1]),
      GL.STATIC_DRAW);
    return () => {
      this.gl.disableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.deleteBuffer(location);
    };
  }

  private initializeTransformBuffer(location: LocationName, spriteCount: number) {
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    const elemCount = 4;
    for (let i = 0; i < 4; i++) {
      const loc = bufferInfo.location + i;
      this.gl.vertexAttribPointer(
        loc,
        elemCount,
        GL.FLOAT,
        false,
        elemCount * 4 * Float32Array.BYTES_PER_ELEMENT,
        i * 4 * Float32Array.BYTES_PER_ELEMENT,
      );
      this.gl.enableVertexAttribArray(loc);
      this.gl.vertexAttribDivisor(loc, 1);
    }
    this.gl.bufferData(GL.ARRAY_BUFFER,
      spriteCount * elemCount * 4 * Float32Array.BYTES_PER_ELEMENT,
      GL.DYNAMIC_DRAW);
    return () => {
      this.gl.disableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.deleteBuffer(location);
    };
  }

  private initializeSlotSizeBuffer(location: LocationName, spriteCount: number) {
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    const loc = bufferInfo.location;
    const elemCount = 2;
    this.gl.vertexAttribPointer(
      loc,
      elemCount,
      GL.FLOAT,
      false,
      elemCount * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    this.gl.enableVertexAttribArray(loc);
    this.gl.vertexAttribDivisor(loc, 1);
    this.gl.bufferData(GL.ARRAY_BUFFER,
      spriteCount * elemCount * Float32Array.BYTES_PER_ELEMENT,
      GL.DYNAMIC_DRAW);
    return () => {
      this.gl.disableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.deleteBuffer(location);
    };
  }

  private initializeInstanceBuffer(location: LocationName, spriteCount: number) {
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    const loc = bufferInfo.location;
    const elemCount = 1;
    this.gl.vertexAttribPointer(
      loc,
      elemCount,
      GL.FLOAT,
      false,
      elemCount * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    this.gl.enableVertexAttribArray(loc);
    this.gl.vertexAttribDivisor(loc, 1);
    this.gl.bufferData(GL.ARRAY_BUFFER,
      Float32Array.from(new Array(spriteCount).fill(null).map((_, index) => index)),
      GL.STATIC_DRAW);

    return () => {
      this.gl.disableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.deleteBuffer(location);
    };
  }

  async updateTextures(imageIds: MediaId[], getMedia: (imageId: MediaId) => Media | undefined): Promise<MediaData[]> {
    const mediaInfos = (await Promise.all(imageIds.map(async imageId => {
      const media = getMedia(imageId);
      if (!media) {
        console.warn(`No media for imageId ${imageId}`);
        return;
      }
      const mediaData = await this.imageManager.renderMedia(imageId, media);
      return { mediaData, imageId };
    }))).filter((data): data is { mediaData: MediaData, imageId: MediaId } => !!data);
    const textureIndices = await Promise.all(mediaInfos.map(async ({ mediaData, imageId }) => {
      const { slot, refreshCallback } = this.textureManager.allocateSlotForImage(mediaData);
      const slotW = Math.log2(slot.size[0]), slotH = Math.log2(slot.size[1]);
      const wh = slotW * 16 + slotH;
      this.textureSlots[imageId] = {
        buffer: Float32Array.from([wh, slot.slotNumber]),
      };
      mediaData.refreshCallback = refreshCallback;
      return slot.textureIndex;
    }));
    const textureIndicesSet = new Set(textureIndices);
    textureIndicesSet.forEach(textureIndex => {
      if (textureIndex === TEXTURE_INDEX_FOR_VIDEO) {
        this.textureManager.setupTextureForVideo(`TEXTURE${textureIndex}` as TextureId);
      } else {
        this.textureManager.generateMipMap(`TEXTURE${textureIndex}` as TextureId);
      }
    });
    return mediaInfos.map(({ mediaData }) => mediaData);;
  }

  private drawElementsInstanced(vertexCount: GLsizei, instances: GLsizei) {
    this.gl.drawElementsInstanced(
      GL.TRIANGLES,
      vertexCount,
      GL.UNSIGNED_SHORT,
      0,
      instances,
    );
  }

  private static readonly spriteMatrix = Matrix.create();
  updateSpriteTransforms(spriteIds: Set<SpriteId>, getSprite: (spriteId: SpriteId) => Sprite | undefined) {
    const bufferInfo = this.attributeBuffers.getAttributeBuffer(TRANSFORM_LOC);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    let topVisibleSprite = this.spriteCount - 1;
    spriteIds.forEach(spriteId => {
      const matrix = GraphicsEngine.spriteMatrix.identity().getMatrix();
      const sprite = getSprite(spriteId);
      sprite?.transforms.forEach(transform => mat4.multiply(matrix, matrix, transform));
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 4 * 4 * Float32Array.BYTES_PER_ELEMENT * spriteId, matrix);
      if (sprite) {
        topVisibleSprite = Math.max(topVisibleSprite, spriteId);
      }
    });
    spriteIds.clear();

    while (topVisibleSprite >= 0 && !getSprite(topVisibleSprite)) {
      topVisibleSprite--;
    }
    this.spriteCount = Math.max(this.spriteCount, topVisibleSprite + 1);
  }

  updateSpriteAnims(spriteIds: Set<SpriteId>, getSprite: (spriteId: SpriteId) => Sprite | undefined) {
    const bufferInfo = this.attributeBuffers.getAttributeBuffer(SLOT_SIZE_LOC);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    spriteIds.forEach(spriteId => {
      const sprite = getSprite(spriteId);
      const slotObj = this.textureSlots[sprite?.imageId ?? -1];
      if (slotObj) {
        const { buffer } = slotObj;
        this.gl.bufferSubData(GL.ARRAY_BUFFER, 2 * Float32Array.BYTES_PER_ELEMENT * spriteId, buffer);
        spriteIds.delete(spriteId);
      }
    });
  }

  updateCameraMatrix(type: CameraMatrixType, matrix: Float32Array) {
    this.gl.uniformMatrix4fv(this.cameraMatrixUniforms[type], false, matrix);
  }

  updateCameraFloat(type: CameraFloatType, value: number) {
    this.gl.uniform1f(this.cameraFloatUniforms[type], value);
  }

  bindVertexArray() {
    return this.own(new VertexArray(this.gl));
  }

  addPixelListener(listener: { x: number, y: number, pixel: number }) {
    this.pixelListeners.add(listener);
    return () => {
      this.removePixelListener(listener);
    };
  }

  removePixelListener(listener: { x: number, y: number, pixel: number }) {
    this.pixelListeners.delete(listener);
  }

  private _pixel: Uint8Array = new Uint8Array(4);
  private getPixel(x: number, y: number): number {
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this._pixel);
    const [r, g, b, _a] = this._pixel;
    return r * (256 * 256) + g * (256) + b;
  }

  refresh(): void {
    // clear background
    this.gl.clear(GL.COLOR_BUFFER_BIT);

    this.drawElementsInstanced(VERTEX_COUNT, this.spriteCount);
    for (const listener of this.pixelListeners) {
      listener.pixel = this.getPixel(listener.x, listener.y);
    }
  }
}
