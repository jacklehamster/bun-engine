// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { GLPrograms } from './gl/programs/GLPrograms';
import { Disposable } from './lifecycle/Disposable';
import { VertexArray } from './gl/VertexArray';
import { GLAttributeBuffers } from './gl/attributes/GLAttributeBuffers';
import { GLUniforms } from './gl/uniforms/GLUniforms';
import {
  GL,
  POSITION_LOC,
  INDEX_LOC,
  TRANSFORM_LOC,
  SLOT_SIZE_LOC,
} from './gl/attributes/Constants';
import { TextureManager } from './gl/texture/TextureManager';
import { ImageManager } from 'gl/texture/ImageManager';
import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { replaceTilda } from 'gl/utils/replaceTilda';
import Matrix from 'gl/transform/Matrix';
import { GLCamera } from 'gl/camera/GLCamera';
import World from 'world/World';
import { mat4 } from 'gl-matrix';

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
  world?: World;
}

export class GLEngine extends Disposable {
  gl: GL;
  programs: GLPrograms;
  attributeBuffers: GLAttributeBuffers;
  uniforms: GLUniforms;
  canvas: HTMLCanvasElement;

  textureManager: TextureManager;
  imageManager: ImageManager;
  camera: GLCamera;

  textureSlots: { buffer: Float32Array, refreshCallback: (() => void) | null }[] = [];

  private world?: World;
  private onDeactivateWorld: () => void = () => { };
  private topVisibleSprite = -1;

  constructor(canvas: HTMLCanvasElement, {
    attributes,
    world,
  }: Props = {}) {
    super();
    this.gl = glProxy(
      canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })!,
    );
    this.canvas = canvas;

    this.programs = this.own(new GLPrograms(this.gl));
    this.uniforms = this.own(new GLUniforms(this.gl, this.programs));
    this.attributeBuffers = this.own(
      new GLAttributeBuffers(this.gl, this.programs),
    );

    this.textureManager = new TextureManager(this.gl, this.uniforms);
    this.imageManager = new ImageManager();
    this.camera = new GLCamera(this.gl, this.uniforms);

    window.addEventListener('resize', this.checkCanvasSize.bind(this));
    this.setWorld(world);
  }

  resetWorld(): void {
    this.textureSlots.length = 0;
    this.onDeactivateWorld();
  }

  setWorld(world?: World): void {
    this.resetWorld();
    this.world = world;
    const onDeactivateWorld = this.world?.activate();
    if (onDeactivateWorld) {
      this.onDeactivateWorld = onDeactivateWorld;
    }
  }

  checkCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth * 2;
    this.canvas.height = this.canvas.offsetHeight * 2;
    this.gl.viewport(
      0, 0,
      this.gl.drawingBufferWidth,
      this.gl.drawingBufferHeight,
    );
    const ratio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;

    this.camera.configProjectionMatrix(ratio);
  }

  async initialize() {
    const PROGRAM_NAME = 'main';
    const replacementMap = {
      AUTHOR: 'Jack le hamster',
    };
    this.programs.addProgram(
      PROGRAM_NAME,
      replaceTilda(vertexShader, replacementMap),
      replaceTilda(fragmentShader, replacementMap),
    );

    this.programs.useProgram(PROGRAM_NAME);

    //  enable depth
    this.gl.enable(GL.DEPTH_TEST);
    this.gl.depthFunc(GL.LESS);
    this.gl.clearDepth(1.0);

    //  enable blend
    this.gl.enable(GL.BLEND);
    this.gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    this.gl.viewport(
      0,
      0,
      this.gl.drawingBufferWidth,
      this.gl.drawingBufferHeight,
    );

    {
      /*
          0  1
          3  2
      */
      const location = INDEX_LOC;
      this.attributeBuffers.createBuffer(location);
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(location);
      this.attributeBuffers.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, bufferInfo);
      this.attributeBuffers.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        location,
        Uint16Array.from([0, 1, 2, 2, 3, 0]),
        0,
        GL.STATIC_DRAW,
      );
    }

    {
      const location = POSITION_LOC;
      this.attributeBuffers.createBuffer(location);
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(location);
      this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
      this.gl.vertexAttribPointer(
        bufferInfo.location,
        2,
        GL.FLOAT,
        false,
        0,
        0,
      );
      this.gl.enableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.bufferData(
        GL.ARRAY_BUFFER,
        location,
        Float32Array.from([
          -1, -1,
          1, -1,
          1, 1,
          -1, 1,
        ]),
        0,
        GL.STATIC_DRAW,
      );
    }

    {
      const location = TRANSFORM_LOC;
      this.attributeBuffers.createBuffer(location);
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(location);
      this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
      for (let i = 0; i < 4; i++) {
        const loc = bufferInfo.location + i;
        this.gl.vertexAttribPointer(
          loc,
          4,
          GL.FLOAT,
          false,
          4 * 4 * Float32Array.BYTES_PER_ELEMENT,
          i * 4 * Float32Array.BYTES_PER_ELEMENT,
        );
        this.gl.enableVertexAttribArray(loc);
        this.gl.vertexAttribDivisor(loc, 1);
      }

      const spriteCount = this.world?.getMaxSpriteCount() ?? 0;
      this.attributeBuffers.bufferData(
        GL.ARRAY_BUFFER,
        location,
        new Float32Array(spriteCount * 4 * 4),
        0,
        GL.DYNAMIC_DRAW,
      );
      this.textureManager.initialize();
    }

    await this.loadTextures();

    this.checkCanvasSize();
  }

  private static readonly spriteMatrix = Matrix.create();
  private updateSprite(spriteIndex: number): boolean {
    GLEngine.spriteMatrix.identity();
    const matrix = GLEngine.spriteMatrix.getMatrix();
    const sprite = this.world?.getSprite(spriteIndex);
    sprite?.transforms.forEach(transform => mat4.multiply(matrix, matrix, transform));
    this.attributeBuffers.bufferSubData(GL.ARRAY_BUFFER, matrix, 4 * 4 * Float32Array.BYTES_PER_ELEMENT * spriteIndex);
    return !!sprite;
  }

  async loadTextures() {
    const numImages = this.world?.getNumImages() ?? 0;
    for (let i = 0; i < numImages; i++) {
      await this.world?.drawImage(i, this.imageManager);
      const mediaInfo = this.imageManager.getMedia(i);
      const { slot, refreshCallback } = this.textureManager.allocateSlotForImage(mediaInfo);
      const slotW = Math.log2(slot.size[0]);
      const slotH = Math.log2(slot.size[1]);
      const wh = slotW * 16 + slotH;
      this.textureSlots[i] = {
        refreshCallback,
        buffer: Float32Array.from([wh, slot.slotNumber]),
      };
    }

    this.textureManager.generateMipMaps();

    {
      const location = SLOT_SIZE_LOC;
      this.attributeBuffers.createBuffer(location);
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(location);
      this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
      const loc = bufferInfo.location;
      this.gl.vertexAttribPointer(
        loc,
        2,
        GL.FLOAT,
        false,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0,
      );
      this.gl.enableVertexAttribArray(loc);
      this.gl.vertexAttribDivisor(loc, 1);
      this.attributeBuffers.bufferData(
        GL.ARRAY_BUFFER,
        location,
        new Float32Array((this.world?.getMaxSpriteCount() ?? 0) * 3),
        0,
        GL.DYNAMIC_DRAW,
      );
    }
  }

  drawElementsInstanced(vertexCount: GLsizei, instances: GLsizei) {
    this.gl.drawElementsInstanced(
      GL.TRIANGLES,
      vertexCount,
      GL.UNSIGNED_SHORT,
      0,
      instances,
    );
  }

  private updateSprites() {
    const spriteIdsToUpdate = this.world?.getUpdatedSpriteTransforms();
    if (spriteIdsToUpdate?.size) {
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(TRANSFORM_LOC);
      this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
      spriteIdsToUpdate?.forEach(spriteId => {
        if (this.updateSprite(spriteId)) {
          this.topVisibleSprite = Math.max(this.topVisibleSprite, spriteId);
        }
      });
      spriteIdsToUpdate?.clear();
    }

    const spriteIdTextureSlotsToUpdate = this.world?.getUpdatedSpriteTextureSlot();
    if (spriteIdTextureSlotsToUpdate?.size) {
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(SLOT_SIZE_LOC);
      this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
      spriteIdTextureSlotsToUpdate?.forEach(spriteId => {
        const sprite = this.world?.getSprite(spriteId);
        if (sprite?.imageId !== undefined) {
          const { buffer } = this.textureSlots[sprite.imageId];
          this.attributeBuffers.bufferSubData(
            GL.ARRAY_BUFFER,
            buffer,
            2 * Float32Array.BYTES_PER_ELEMENT * spriteId,
          );
        }
      });
    }
    spriteIdTextureSlotsToUpdate?.clear();

    while (!this.world?.getSprite(this.topVisibleSprite)) {
      this.topVisibleSprite--;
    }

    return this.topVisibleSprite + 1;
  }

  refresh() {
    this.gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    const vertexCount = 6;
    this.world?.syncWithCamera(this.camera);
    const instanceCount = this.updateSprites();
    this.drawElementsInstanced(vertexCount, instanceCount);
  }

  bindVertexArray() {
    return this.own(new VertexArray(this.gl));
  }

  start() {
    let handle = 0;
    const loop = () => {
      this.refresh();
      handle = requestAnimationFrame(loop);
    };
    this.refresh();
    loop();
    () => {
      cancelAnimationFrame(handle);
    };
  }
}
