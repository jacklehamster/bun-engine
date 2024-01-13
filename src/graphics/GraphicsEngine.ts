// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { GLPrograms } from '../gl/programs/GLPrograms';
import { Disposable } from '../gl/lifecycle/Disposable';
import { GLAttributeBuffers } from '../gl/attributes/GLAttributeBuffers';
import { GLUniforms } from '../gl/uniforms/GLUniforms';
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
  CAM_DISTANCE_LOC,
  BG_COLOR_LOC,
  BG_BLUR_LOC,
  SPRITE_TYPE_LOC,
} from '../gl/attributes/Constants';
import { TEXTURE_INDEX_FOR_VIDEO, TextureId, TextureManager } from '../gl/texture/TextureManager';
import { MediaId, ImageManager } from 'gl/texture/ImageManager';
import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { replaceTilda } from 'gl/utils/replaceTilda';
import Matrix from 'gl/transform/Matrix';
import { FloatUniform, VectorUniform } from "./Uniforms";
import { MatrixUniform } from "./Uniforms";
import { MediaData } from 'gl/texture/MediaData';
import { Media } from 'gl/texture/Media';
import { SpriteId, SpriteType } from 'world/sprite/Sprite';
import { IGraphicsEngine } from './IGraphicsEngine';
import { Sprites } from 'world/sprite/Sprites';
import { vector } from 'gl/transform/IMatrix';

const DEFAULT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: true,
  failIfMajorPerformanceCaveat: undefined,
  powerPreference: 'default',
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  stencil: false,
};

const VERTICES_PER_SPRITE = 6;

const LOG_GL = false;

const EMPTY_VEC2 = Float32Array.from([0, 0]);

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

  private textureSlots: Record<MediaId, { buffer: Float32Array }> = {};

  private onResize: Set<(w: number, h: number) => void> = new Set();
  private pixelListener?: { x: number; y: number; setPixel(value: number): void };
  private spriteCount = 0;
  private maxSpriteCount = 0;
  private matrixUniforms: Record<MatrixUniform, WebGLUniformLocation>;
  private floatUniforms: Record<FloatUniform, WebGLUniformLocation>;
  private vec3Uniforms: Record<VectorUniform, WebGLUniformLocation>;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, {
    attributes,
  }: Props = {}) {
    super();
    const gl: WebGL2RenderingContext = canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })! as WebGL2RenderingContext;
    this.gl = glProxy(gl);
    this.canvas = canvas;

    this.programs = this.own(new GLPrograms(this.gl));
    this.uniforms = new GLUniforms(this.gl, this.programs);

    this.textureManager = new TextureManager(this.gl, this.uniforms);
    this.imageManager = new ImageManager();

    const onResize = this.checkCanvasSize.bind(this);
    window.addEventListener('resize', onResize);
    this.addOnDestroy(() => window.removeEventListener('resize', onResize));

    const PROGRAM_NAME = 'main';
    const replacementMap = {
      AUTHOR: 'Jack le hamster',
    };
    this.programs.addProgram(PROGRAM_NAME,
      replaceTilda(vertexShader, replacementMap),
      replaceTilda(fragmentShader, replacementMap),
    );

    this.matrixUniforms = {
      [MatrixUniform.PROJECTION]: this.uniforms.getUniformLocation(CAM_PROJECTION_LOC, PROGRAM_NAME),
      [MatrixUniform.CAM_POS]: this.uniforms.getUniformLocation(CAM_POS_LOC, PROGRAM_NAME),
      [MatrixUniform.CAM_TURN]: this.uniforms.getUniformLocation(CAM_TURN_LOC, PROGRAM_NAME),
      [MatrixUniform.CAM_TILT]: this.uniforms.getUniformLocation(CAM_TILT_LOC, PROGRAM_NAME),
    };
    this.floatUniforms = {
      [FloatUniform.CURVATURE]: this.uniforms.getUniformLocation(CAM_CURVATURE_LOC, PROGRAM_NAME),
      [FloatUniform.CAM_DISTANCE]: this.uniforms.getUniformLocation(CAM_DISTANCE_LOC, PROGRAM_NAME),
      [FloatUniform.BG_BLUR]: this.uniforms.getUniformLocation(BG_BLUR_LOC, PROGRAM_NAME),
    };
    this.vec3Uniforms = {
      [VectorUniform.BG_COLOR]: this.uniforms.getUniformLocation(BG_COLOR_LOC, PROGRAM_NAME),
    };

    this.attributeBuffers = this.own(new GLAttributeBuffers(this.gl, this.programs));

    this.initialize(PROGRAM_NAME);
  }

  addResizeListener(listener: (w: number, h: number) => void): () => void {
    listener(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.onResize.add(listener);
    return () => this.removeResizeListener(listener);
  }

  removeResizeListener(listener: (w: number, h: number) => void): void {
    this.onResize.delete(listener);
  }

  clearTextureSlots(): void {
    for (let i in this.textureSlots) {
      delete this.textureSlots[i];
    }
  }

  checkCanvasSize(): void {
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = this.canvas.offsetWidth * 2;
      this.canvas.height = this.canvas.offsetHeight * 2;
    }
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.onResize.forEach(callback => callback(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight));
  }

  private initialize(programName: string) {
    this.programs.useProgram(programName);

    //  enable depth
    this.gl.enable(GL.DEPTH_TEST);
    this.gl.depthFunc(GL.LESS);
    this.gl.clearDepth(1.0);

    //  enable blend
    this.gl.enable(GL.BLEND);
    this.gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

    // disable face culling
    this.gl.enable(GL.CULL_FACE);
    this.gl.cullFace(GL.BACK);

    // clear background color
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.textureManager.initialize();
    this.checkCanvasSize();
  }

  activate(): void {
    this.clearTextureSlots();
  }

  setMaxSpriteCount(count: number): void {
    if (count > this.maxSpriteCount) {
      this.maxSpriteCount = 1 << Math.ceil(Math.log2(count));
      this.ensureBuffers(this.maxSpriteCount);
    }
  }

  setBgColor(rgb: vector): void {
    this.gl.clearColor(rgb[0], rgb[1], rgb[2], 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  private ensureBuffers(instanceCount: number) {
    console.log("Sprite limit", instanceCount);

    if (!this.attributeBuffers.hasBuffer(INDEX_LOC)) {
      this.attributeBuffers.createBuffer({
        location: INDEX_LOC,
        target: GL.ELEMENT_ARRAY_BUFFER,
        usage: GL.STATIC_DRAW,
        vertexAttribPointerRows: 0,
        data: Uint16Array.from([0, 1, 2, 2, 3, 0]),
      });
    }
    if (!this.attributeBuffers.hasBuffer(POSITION_LOC)) {
      this.attributeBuffers.createBuffer({
        location: POSITION_LOC,
        target: GL.ARRAY_BUFFER,
        usage: GL.STATIC_DRAW,
        vertexAttribPointerRows: 1,
        elemCount: 2,
        data: Float32Array.from([-1, -1, 1, -1, 1, 1, -1, 1]),
      });
    }
    if (!this.attributeBuffers.hasBuffer(TRANSFORM_LOC)) {
      this.attributeBuffers.createBuffer({
        location: TRANSFORM_LOC,
        target: GL.ARRAY_BUFFER,
        usage: GL.DYNAMIC_DRAW,
        vertexAttribPointerRows: 4,
        elemCount: 4,
        divisor: 1,
        instanceCount,
      });
    } else {
      this.attributeBuffers.ensureSize(TRANSFORM_LOC, instanceCount);
    }
    if (!this.attributeBuffers.hasBuffer(SLOT_SIZE_LOC)) {
      this.attributeBuffers.createBuffer({
        location: SLOT_SIZE_LOC,
        target: GL.ARRAY_BUFFER,
        usage: GL.DYNAMIC_DRAW,
        vertexAttribPointerRows: 1,
        elemCount: 2,
        divisor: 1,
        instanceCount,
      });
    } else {
      this.attributeBuffers.ensureSize(SLOT_SIZE_LOC, instanceCount);
    }
    if (!this.attributeBuffers.hasBuffer(INSTANCE_LOC)) {
      this.attributeBuffers.createBuffer({
        location: INSTANCE_LOC,
        target: GL.ARRAY_BUFFER,
        usage: GL.STATIC_DRAW,
        vertexAttribPointerRows: 1,
        elemCount: 1,
        divisor: 1,
        instanceCount,
        callback: index => index,
      });
    } else {
      this.attributeBuffers.ensureSize(INSTANCE_LOC, instanceCount);
    }
    if (!this.attributeBuffers.hasBuffer(SPRITE_TYPE_LOC)) {
      this.attributeBuffers.createBuffer({
        location: SPRITE_TYPE_LOC,
        target: GL.ARRAY_BUFFER,
        usage: GL.STATIC_DRAW,
        vertexAttribPointerRows: 1,
        elemCount: 1,
        divisor: 1,
        instanceCount,
      });
    } else {
      this.attributeBuffers.ensureSize(SPRITE_TYPE_LOC, instanceCount);
    }
    return this.attributeBuffers;
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
      instances);
  }

  updateSpriteTransforms(spriteIds: Set<SpriteId>, sprites: Sprites) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindVertexArray();
    attributeBuffers.bindBuffer(TRANSFORM_LOC);
    let topVisibleSprite = this.spriteCount - 1;
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 4 * 4 * Float32Array.BYTES_PER_ELEMENT * spriteId, (sprite?.transform ?? Matrix.HIDDEN).getMatrix());
      if (sprite) {
        topVisibleSprite = Math.max(topVisibleSprite, spriteId);
      }
    });
    spriteIds.clear();

    while (topVisibleSprite >= 0 && !sprites.at(topVisibleSprite)) {
      topVisibleSprite--;
    }
    this.spriteCount = Math.max(this.spriteCount, topVisibleSprite + 1);
  }

  updateSpriteAnims(spriteIds: Set<SpriteId>, sprites: Sprites) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindVertexArray();
    attributeBuffers.bindBuffer(SLOT_SIZE_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      const slotObj = sprite ? this.textureSlots[sprite.imageId] : undefined;
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 2 * Float32Array.BYTES_PER_ELEMENT * spriteId, slotObj?.buffer ?? EMPTY_VEC2);
      const spriteWaitingForTexture = sprite && !slotObj;
      if (!spriteWaitingForTexture) {
        spriteIds.delete(spriteId);
      }
    });
  }

  private static tempBuffer: Float32Array = new Float32Array(2);
  updateSpriteTypes(spriteIds: Set<SpriteId>, sprites: Sprites) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindVertexArray();
    attributeBuffers.bindBuffer(SPRITE_TYPE_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      const type = sprite?.spriteType ?? SpriteType.DEFAULT;
      GraphicsEngine.tempBuffer[0] = type;
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 1 * Float32Array.BYTES_PER_ELEMENT * spriteId, GraphicsEngine.tempBuffer);
    });
    spriteIds.clear();
  }

  updateUniformMatrix(type: MatrixUniform, matrix: Float32Array) {
    this.gl.uniformMatrix4fv(this.matrixUniforms[type], false, matrix);
  }

  updateUniformFloat(type: FloatUniform, value: number) {
    this.gl.uniform1f(this.floatUniforms[type], value);
  }

  updateUniformVector(type: VectorUniform, vector: vector) {
    this.gl.uniform3fv(this.vec3Uniforms[type], vector);
  }

  setPixelListener(listener?: { x: number, y: number, setPixel(value: number): void }) {
    this.pixelListener = listener;
  }

  private _pixel: Uint8Array = new Uint8Array(4);
  private getPixel(x: number, y: number): number {
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this._pixel);
    const [r, g, b, _a] = this._pixel;
    return r * (256 * 256) + g * (256) + b;
  }

  private static clearBit = GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT;
  refresh(): void {
    this.gl.clear(GraphicsEngine.clearBit);
    this.attributeBuffers.bindVertexArray();
    this.drawElementsInstanced(VERTICES_PER_SPRITE, this.spriteCount);
    this.gl.bindVertexArray(null);

    this.pixelListener?.setPixel(this.getPixel(this.pixelListener.x, this.pixelListener.y));
  }
}
