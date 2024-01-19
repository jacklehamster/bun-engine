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
  TIME_LOC,
  ANIM_LOC,
} from '../gl/attributes/Constants';
import Matrix from 'gl/transform/Matrix';
import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { TEXTURE_INDEX_FOR_VIDEO, TextureId, TextureManager } from '../gl/texture/TextureManager';
import { MediaId, ImageManager } from 'gl/texture/ImageManager';
import { replaceTilda } from 'gl/utils/replaceTilda';
import { FloatUniform, VectorUniform } from "./Uniforms";
import { MatrixUniform } from "./Uniforms";
import { MediaData } from 'gl/texture/MediaData';
import { Medias } from "gl/texture/Medias";
import { SpriteId, SpriteType } from 'world/sprite/Sprite';
import { IGraphicsEngine } from './IGraphicsEngine';
import { Sprites } from 'world/sprite/Sprites';
import { IMatrix, Vector } from 'gl/transform/IMatrix';
import { SpriteSheet } from 'gl/texture/spritesheet/SpriteSheet';
import { Priority } from "updates/Priority";
import { map } from 'world/sprite/List';
import { Animation, AnimationId } from 'animation/Animation';
import { Animations } from "animation/Animations";

const VERTICES_PER_SPRITE = 6;

const TEX_BUFFER_ELEMS = 4;
const EMPTY_TEX = new Float32Array(TEX_BUFFER_ELEMS).fill(0);

export interface Props {
  attributes?: WebGLContextAttributes;
}

export class GraphicsEngine extends Disposable implements IGraphicsEngine {
  priority = Priority.LAST;

  private programs: GLPrograms;
  private attributeBuffers: GLAttributeBuffers;
  private uniforms: GLUniforms;

  private textureManager: TextureManager;
  private imageManager: ImageManager;

  private textureSlots: Map<MediaId, { buffer: Float32Array }> = new Map();
  private animationSlots: Map<AnimationId, Animation> = new Map();

  private pixelListener?: { x: number; y: number; setPixel(value: number): void };
  private maxSpriteCount = 0;
  private matrixUniforms: Record<MatrixUniform, WebGLUniformLocation>;
  private floatUniforms: Record<FloatUniform, WebGLUniformLocation>;
  private vec3Uniforms: Record<VectorUniform, WebGLUniformLocation>;

  private tempBuffer = new Float32Array(4).fill(0);
  private visibleSprites: boolean[] = [];

  constructor(private gl: GL) {
    super();
    this.programs = this.own(new GLPrograms(this.gl));
    this.uniforms = new GLUniforms(this.gl, this.programs);

    this.textureManager = new TextureManager(this.gl, this.uniforms);
    this.imageManager = new ImageManager();

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
      [FloatUniform.TIME]: this.uniforms.getUniformLocation(TIME_LOC, PROGRAM_NAME),
    };
    this.vec3Uniforms = {
      [VectorUniform.BG_COLOR]: this.uniforms.getUniformLocation(BG_COLOR_LOC, PROGRAM_NAME),
    };

    this.attributeBuffers = this.own(new GLAttributeBuffers(this.gl, this.programs));

    this.initialize(PROGRAM_NAME);
  }

  resetViewportSize() {
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
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
  }

  deactivate(): void {
    this.textureSlots.clear();
    this.animationSlots.clear();
    this.visibleSprites.length = 0;
  }

  setMaxSpriteCount(count: number): void {
    if (count > this.maxSpriteCount) {
      this.maxSpriteCount = 1 << Math.ceil(Math.log2(count));
      this.ensureBuffers(this.maxSpriteCount);
    }
  }

  setBgColor(rgb: Vector): void {
    this.gl.clearColor(rgb[0], rgb[1], rgb[2], 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  private ensureBuffers(instanceCount: number) {
    if (instanceCount >= 10000) {
      console.warn("Sprite limit has already reached:", instanceCount);
    }

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
        elemCount: TEX_BUFFER_ELEMS,
        divisor: 1,
        instanceCount,
      });
    } else {
      this.attributeBuffers.ensureSize(SLOT_SIZE_LOC, instanceCount);
    }
    if (!this.attributeBuffers.hasBuffer(ANIM_LOC)) {
      this.attributeBuffers.createBuffer({
        location: ANIM_LOC,
        target: GL.ARRAY_BUFFER,
        usage: GL.DYNAMIC_DRAW,
        vertexAttribPointerRows: 1,
        elemCount: 4,
        divisor: 1,
        instanceCount,
      });
    } else {
      this.attributeBuffers.ensureSize(ANIM_LOC, instanceCount);
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

  async updateTextures(ids: Set<MediaId>, medias: Medias): Promise<MediaData[]> {
    const mediaList = Array.from(ids).map(index => medias.at(index));
    ids.clear();
    const mediaInfos = (await Promise.all(map(mediaList, async media => {
      if (media?.id === undefined) {
        return;
      }
      const mediaData = await this.imageManager.renderMedia(media.id, media);
      return { mediaData, mediaId: media.id, spriteSheet: media.spriteSheet };
    }))).filter((data): data is { mediaData: MediaData, mediaId: MediaId, spriteSheet: SpriteSheet | undefined } => !!data);
    const textureIndices = await Promise.all(mediaInfos.map(async ({ mediaData, mediaId, spriteSheet }) => {
      const { slot, refreshCallback } = this.textureManager.allocateSlotForImage(mediaData);
      const slotW = Math.log2(slot.size[0]), slotH = Math.log2(slot.size[1]);
      const wh = slotW * 16 + slotH;
      const [spriteWidth, spriteHeight] = spriteSheet?.spriteSize ?? [mediaData.width, mediaData.height];
      this.textureSlots.set(mediaId, {
        buffer: Float32Array.from([wh, slot.slotNumber, spriteWidth / mediaData.width, spriteHeight / mediaData.height]),
      });
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
    attributeBuffers.bindBuffer(TRANSFORM_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 4 * 4 * Float32Array.BYTES_PER_ELEMENT * spriteId, (sprite?.transform ?? Matrix.HIDDEN).getMatrix());
      if (sprite) {
        this.visibleSprites[spriteId] = true;
      } else {
        this.visibleSprites[spriteId] = false;
      }
    });
    spriteIds.clear();

    while (this.visibleSprites.length && !this.visibleSprites[this.visibleSprites.length - 1]) {
      this.visibleSprites.length--;
    }
  }

  updateSpriteTexSlots(spriteIds: Set<SpriteId>, sprites: Sprites) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindBuffer(SLOT_SIZE_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      if (!sprite) {
        return;
      }
      const slotObj = this.textureSlots.get(sprite.imageId);
      let buffer = slotObj?.buffer ?? EMPTY_TEX;
      if (sprite.flip) {
        this.tempBuffer[0] = buffer[0];
        this.tempBuffer[1] = buffer[1];
        this.tempBuffer[2] = -buffer[2];
        this.tempBuffer[3] = buffer[3];
        buffer = this.tempBuffer;
      }
      this.gl.bufferSubData(GL.ARRAY_BUFFER, TEX_BUFFER_ELEMS * Float32Array.BYTES_PER_ELEMENT * spriteId, buffer);
      const spriteWaitingForTexture = sprite && !slotObj;
      if (!spriteWaitingForTexture) {
        spriteIds.delete(spriteId);
      }
    });
  }

  updateSpriteTypes(spriteIds: Set<SpriteId>, sprites: Sprites) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindBuffer(SPRITE_TYPE_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      if (!sprite) {
        return;
      }
      const type = sprite.spriteType ?? SpriteType.DEFAULT;
      this.tempBuffer[0] = type;
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 1 * Float32Array.BYTES_PER_ELEMENT * spriteId, this.tempBuffer, 0, 1);
    });
    spriteIds.clear();
  }

  updateSpriteAnimations(spriteIds: Set<SpriteId>, sprites: Sprites) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindBuffer(ANIM_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      if (sprite?.animationId === undefined) {
        return;
      }
      const animation = this.animationSlots.get(sprite.animationId);
      this.tempBuffer[0] = animation?.frames?.[0] ?? 0;
      this.tempBuffer[1] = animation?.frames?.[1] ?? this.tempBuffer[0];
      this.tempBuffer[2] = animation?.fps ?? 0;
      this.tempBuffer[3] = animation?.maxFrameCount ?? Number.MAX_SAFE_INTEGER;
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 4 * Float32Array.BYTES_PER_ELEMENT * spriteId, this.tempBuffer);
    });
    spriteIds.clear();
  }

  updateAnimationDefinitions(ids: Set<AnimationId>, animations: Animations) {
    for (let id of ids) {
      const animation = animations.at(id);
      if (animation?.id !== undefined) {
        this.animationSlots.set(animation.id, animation);
      }
    }
    ids.clear();
  }

  updateUniformMatrix(type: MatrixUniform, matrix: IMatrix) {
    this.gl.uniformMatrix4fv(this.matrixUniforms[type], false, matrix.getMatrix());
  }

  updateUniformFloat(type: FloatUniform, value: number) {
    this.gl.uniform1f(this.floatUniforms[type], value);
  }

  updateUniformVector(type: VectorUniform, vector: Vector) {
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
    if (this.visibleSprites.length) {
      this.drawElementsInstanced(VERTICES_PER_SPRITE, this.visibleSprites.length);
      this.pixelListener?.setPixel(this.getPixel(this.pixelListener.x, this.pixelListener.y));
    }
  }
}
