// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { GLPrograms } from '../gl/programs/GLPrograms';
import { Disposable } from '../lifecycle/Disposable';
import { VertexArray } from '../gl/VertexArray';
import { GLAttributeBuffers, LocationName } from '../gl/attributes/GLAttributeBuffers';
import { GLUniforms } from '../gl/uniforms/GLUniforms';
import {
  GL,
  POSITION_LOC,
  INDEX_LOC,
  TRANSFORM_LOC,
  SLOT_SIZE_LOC,
  CAM_LOC,
  PROJECTION_LOC,
} from '../gl/attributes/Constants';
import { TEXTURE_INDEX_FOR_VIDEO, TextureId, TextureManager } from '../gl/texture/TextureManager';
import { ImageId, ImageManager } from 'gl/texture/ImageManager';
import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { replaceTilda } from 'gl/utils/replaceTilda';
import Matrix from 'gl/transform/Matrix';
import { CameraMatrixType } from 'gl/camera/Camera';
import World from 'world/World';
import { mat4 } from 'gl-matrix';
import { Motor, Update } from './Motor';
import { MediaInfo } from 'gl/texture/MediaInfo';

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

export class GraphicsEngine extends Disposable implements Update {
  private gl: GL;
  private programs: GLPrograms;
  private attributeBuffers: GLAttributeBuffers;
  private uniforms: GLUniforms;
  private canvas: HTMLCanvasElement;

  private textureManager: TextureManager;
  private imageManager: ImageManager;

  private textureSlots: {
    buffer: Float32Array,
  }[] = [];

  private world?: World;
  private onDeactivateWorlds: Set<() => void> = new Set();
  private onCleanupBuffers: Set<() => void> = new Set();
  private topVisibleSprite = -1;
  private cameraMatrixUniforms: Record<CameraMatrixType | any, WebGLUniformLocation> = {};

  constructor(canvas: HTMLCanvasElement, {
    attributes,
  }: Props = {}) {
    super();
    this.gl = glProxy(
      canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })!,
    );
    this.canvas = canvas;

    this.programs = this.own(new GLPrograms(this.gl));
    this.uniforms = this.own(new GLUniforms(this.gl, this.programs));
    this.attributeBuffers = this.own(new GLAttributeBuffers(this.gl, this.programs));

    this.textureManager = new TextureManager(this.gl, this.uniforms);
    this.imageManager = new ImageManager();

    const onResize = this.checkCanvasSize.bind(this);
    window.addEventListener('resize', onResize);
    this.addOnDestroy(() => window.removeEventListener('resize', onResize));
    this.addOnDestroy(() => this.resetWorld());
    this.initialize();
  }

  resetWorld(): void {
    this.textureSlots.length = 0;
    this.onDeactivateWorlds.forEach(callback => callback());
    this.onDeactivateWorlds.clear();
    this.onCleanupBuffers.forEach(cleanup => cleanup());
    this.onCleanupBuffers.clear();
  }

  setWorld(world?: World): void {
    this.resetWorld();
    this.world = world;
    this.initializeBuffers(world?.getMaxSpriteCount() ?? 0);

    const ratio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
    world?.getCamera()?.configProjectionMatrix(ratio);

    const onDeactivateWorld = world?.activate();
    if (onDeactivateWorld) {
      this.onDeactivateWorlds.add(onDeactivateWorld);
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
    this.world?.getCamera()?.configProjectionMatrix(ratio);
    //  TODO: we need to update "updatedCameraMatrices" in world.
  }

  private initialize() {
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

    this.cameraMatrixUniforms[CameraMatrixType.PROJECTION] = this.uniforms.getUniformLocation(PROJECTION_LOC, PROGRAM_NAME);
    this.cameraMatrixUniforms[CameraMatrixType.VIEW] = this.uniforms.getUniformLocation(CAM_LOC, PROGRAM_NAME);

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

    const maxSpriteCount = this.world?.getMaxSpriteCount() ?? 0;
    this.initializeBuffers(maxSpriteCount);

    this.textureManager.initialize();
    this.checkCanvasSize();
  }

  initializeBuffers(maxSpriteCount: number) {
    this.onCleanupBuffers.forEach(cleanup => cleanup());
    this.onCleanupBuffers.clear();
    if (maxSpriteCount) {
      const cleanups = [
        this.initializeIndexBuffer(INDEX_LOC),
        this.initializePositionBuffer(POSITION_LOC),
        this.initializeTransformBuffer(TRANSFORM_LOC, maxSpriteCount),
        this.initializeSlotSizeBuffer(SLOT_SIZE_LOC, maxSpriteCount),
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
    this.gl.bufferData(GL.ARRAY_BUFFER,
      spriteCount * 4 * 4 * Float32Array.BYTES_PER_ELEMENT,
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
    this.gl.bufferData(GL.ARRAY_BUFFER,
      spriteCount * 2 * Float32Array.BYTES_PER_ELEMENT,
      GL.DYNAMIC_DRAW);
    return () => {
      this.gl.disableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.deleteBuffer(location);
    };
  }

  private static readonly spriteMatrix = Matrix.create();
  private updateSprite(spriteIndex: number): boolean {
    GraphicsEngine.spriteMatrix.identity();
    const matrix = GraphicsEngine.spriteMatrix.getMatrix();
    const sprite = this.world?.getSprite(spriteIndex);
    sprite?.transforms.forEach(transform => mat4.multiply(matrix, matrix, transform));
    this.gl.bufferSubData(GL.ARRAY_BUFFER, 4 * 4 * Float32Array.BYTES_PER_ELEMENT * spriteIndex, matrix);
    return !!sprite;
  }

  private async updateTextures(imageIds: ImageId[], world: World): Promise<MediaInfo[]> {
    const mediaInfos = await Promise.all(imageIds.map(async imageId => {
      const mediaInfo = (await world.drawImage(imageId, this.imageManager))!;
      return { mediaInfo, imageId };
    }));
    const textureIndices = await Promise.all(mediaInfos.map(async ({ mediaInfo, imageId }) => {
      const { slot, refreshCallback } = this.textureManager.allocateSlotForImage(mediaInfo);
      const slotW = Math.log2(slot.size[0]), slotH = Math.log2(slot.size[1]);
      const wh = slotW * 16 + slotH;
      this.textureSlots[imageId] = {
        buffer: Float32Array.from([wh, slot.slotNumber]),
      };
      mediaInfo.refreshCallback = refreshCallback;
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
    return mediaInfos.map(({ mediaInfo }) => mediaInfo);;
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

  private updateSprites(world: World) {
    const spriteIdsToUpdate = world.getUpdatedSpriteTransforms();
    if (spriteIdsToUpdate.size) {
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(TRANSFORM_LOC);
      this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
      spriteIdsToUpdate?.forEach(spriteId => {
        if (this.updateSprite(spriteId)) {
          this.topVisibleSprite = Math.max(this.topVisibleSprite, spriteId);
        }
      });
      spriteIdsToUpdate.clear();
    }

    const spriteIdTextureSlotsToUpdate = world.getUpdatedSpriteTextureSlot();
    if (spriteIdTextureSlotsToUpdate.size) {
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(SLOT_SIZE_LOC);
      this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
      spriteIdTextureSlotsToUpdate?.forEach(spriteId => {
        const sprite = world.getSprite(spriteId);
        const slotObj = this.textureSlots[sprite?.imageId ?? -1];
        if (slotObj) {
          const { buffer } = slotObj;
          this.gl.bufferSubData(GL.ARRAY_BUFFER, 2 * Float32Array.BYTES_PER_ELEMENT * spriteId, buffer);
          spriteIdTextureSlotsToUpdate.delete(spriteId);
        }
      });
    }

    while (!world.getSprite(this.topVisibleSprite)) {
      this.topVisibleSprite--;
    }

    return this.topVisibleSprite + 1;
  }

  refresh(world: World, motor: Motor) {
    const camsUpdated = world.getUpdatedCamMatrices();
    if (camsUpdated.size) {
      camsUpdated.forEach(type => {
        const matrix = world.getCameraMatrix(type);
        this.gl.uniformMatrix4fv(this.cameraMatrixUniforms[type], false, matrix);
      });
      camsUpdated.clear();
    }

    const imageIds = world.getUpdateImageIds();
    if (imageIds.size) {
      const images = Array.from(imageIds.keys());
      imageIds.clear();
      this.updateTextures(images, world).then(mediaInfos => {
        mediaInfos.forEach(mediaInfo => {
          if (mediaInfo.isVideo) {
            motor.addUpdate(mediaInfo);
          }
        });
      });
    }
    const instanceCount = this.updateSprites(world);
    this.drawElementsInstanced(VERTEX_COUNT, instanceCount);
  }

  bindVertexArray() {
    return this.own(new VertexArray(this.gl));
  }

  update(motor: Motor, deltaTime: number): void {
    if (this.world) {
      this.world.refresh?.(deltaTime);
      this.refresh(this.world, motor);
    }
  }

  period = 1;
}
