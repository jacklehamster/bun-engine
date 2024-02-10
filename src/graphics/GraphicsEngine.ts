// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import {
  GL,
  POSITION_LOC,
  INDEX_LOC,
  TRANSFORM_LOC,
  SLOT_SIZE_LOC,
  INSTANCE_LOC,
  SPRITE_TYPE_LOC,
  ANIM_LOC,
} from '../gl/attributes/Constants';

import { GLPrograms } from '../gl/programs/GLPrograms';
import { Disposable } from '../gl/lifecycle/Disposable';
import { GLAttributeBuffers, LocationName } from '../gl/attributes/GLAttributeBuffers';

import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { TextureManager, MediaId, MediaData, Media, ImageManager } from 'gl-texture-manager';
import { replaceTilda } from 'gl/utils/replaceTilda';
import { Sprite, SpriteId } from 'world/sprite/Sprite';
import { SpriteType } from "world/sprite/SpriteType";
import { IGraphicsEngine } from './IGraphicsEngine';
import { Priority, UpdatePayload } from "motor-loop";
import { List } from 'abstract-list';
import { Animation, AnimationId } from 'animation/Animation';
import { TextureUniformInitializer } from '../gl/uniforms/TextureUniformsInitializer';
import { MatrixUniformHandler } from 'gl/uniforms/update/MatrixUniformHandler';
import { FloatUniformHandler } from 'gl/uniforms/update/FloatUniformHandler';
import { VectorUniformHandler } from 'gl/uniforms/update/VectorUniformHandler';
import { TextureUpdateHandler } from 'updates/texture/TextureUpdateHandler';
import { Vector } from 'dok-types';
import { IMatrix, Matrix } from 'dok-matrix';
import { NumVal } from 'progressive-value';

const VERTICES_PER_SPRITE = 6;

const TEX_BUFFER_ELEMS = 4;
const EMPTY_TEX = new Float32Array(TEX_BUFFER_ELEMS).fill(0);

export class GraphicsEngine extends Disposable implements IGraphicsEngine {
  priority = Priority.LAST;

  private programs: GLPrograms;
  private attributeBuffers: GLAttributeBuffers;

  private animationSlots: Map<AnimationId, Animation> = new Map();

  private pixelListener?: { x: number; y: number; setPixel(value: number): void };
  private maxSpriteCount = 0;

  private textureUpdateHandler: TextureUpdateHandler;

  private tempBuffer = new Float32Array(4).fill(0);
  private visibleSprites: boolean[] = [];

  constructor(private gl: GL) {
    super();
    this.programs = this.own(new GLPrograms(gl));


    const textureManager = new TextureManager({ gl });
    this.textureUpdateHandler = new TextureUpdateHandler({
      imageManager: new ImageManager(),
      textureManager,
    })
    this.addOnDestroy(() => textureManager.dispose());

    const PROGRAM_NAME = 'main';
    const replacementMap = {
      AUTHOR: 'Jack le hamster',
    };
    this.programs.addProgram(PROGRAM_NAME,
      replaceTilda(vertexShader, replacementMap),
      replaceTilda(fragmentShader, replacementMap),
    );

    this.attributeBuffers = this.own(new GLAttributeBuffers(gl, this.programs));

    this.initialize(PROGRAM_NAME);
    TextureUniformInitializer.initialize({ gl, program: this.programs.getProgram()! });
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
  }

  deactivate(): void {
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
    if (instanceCount >= 100000) {
      console.warn("Sprite count has already reached:", instanceCount);
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

  async updateTextures(ids: Set<MediaId>, medias: List<Media>): Promise<MediaData[]> {
    return this.textureUpdateHandler.updateTextures(ids, medias);
  }

  updateSpriteTransforms(spriteIds: Set<SpriteId>, sprites: List<Sprite>) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindBuffer(TRANSFORM_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      const visible = !!(sprite && !sprite?.hidden);
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 4 * 4 * Float32Array.BYTES_PER_ELEMENT * spriteId, (!visible ? Matrix.HIDDEN : sprite.transform).getMatrix());
      this.visibleSprites[spriteId] = visible;
    });
    spriteIds.clear();

    while (this.visibleSprites.length && !this.visibleSprites[this.visibleSprites.length - 1]) {
      this.visibleSprites.length--;
    }
  }

  updateSpriteTexSlots(spriteIds: Set<SpriteId>, sprites: List<Sprite>) {
    const attributeBuffers = this.attributeBuffers;
    attributeBuffers.bindBuffer(SLOT_SIZE_LOC);
    spriteIds.forEach(spriteId => {
      const sprite = sprites.at(spriteId);
      if (!sprite) {
        spriteIds.delete(spriteId);
        return;
      }
      const slotBuffer = this.textureUpdateHandler.getSlotBuffer(sprite.imageId);
      let buffer = slotBuffer ?? EMPTY_TEX;
      if ((sprite.orientation ?? 1) < 0) {
        this.tempBuffer[0] = buffer[0];
        this.tempBuffer[1] = buffer[1];
        this.tempBuffer[2] = -buffer[2];
        this.tempBuffer[3] = buffer[3];
        buffer = this.tempBuffer;
      }
      this.gl.bufferSubData(GL.ARRAY_BUFFER, TEX_BUFFER_ELEMS * Float32Array.BYTES_PER_ELEMENT * spriteId, buffer);
      const spriteWaitingForTexture = sprite && !slotBuffer;
      if (!spriteWaitingForTexture) {
        spriteIds.delete(spriteId);
      }
    });
  }

  updateSpriteTypes(spriteIds: Set<SpriteId>, sprites: List<Sprite>) {
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

  updateSpriteAnimations(spriteIds: Set<SpriteId>, sprites: List<Sprite>) {
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

  updateAnimationDefinitions(ids: Set<AnimationId>, animations: List<Animation>) {
    for (let id of ids) {
      const animation = animations.at(id.valueOf());
      if (animation !== undefined) {
        this.animationSlots.set(animation.id, animation);
      }
    }
    ids.clear();
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
  refresh(updatePayload: UpdatePayload): void {
    if (updatePayload.renderFrame) {
      this.gl.clear(GraphicsEngine.clearBit);
      if (this.visibleSprites.length) {
        this.#drawElementsInstanced(VERTICES_PER_SPRITE, this.visibleSprites.length);
        this.pixelListener?.setPixel(this.getPixel(this.pixelListener.x, this.pixelListener.y));
      }
    }
  }

  createMatrixUniformHandler(name: LocationName, matrix: IMatrix): MatrixUniformHandler {
    return new MatrixUniformHandler({
      gl: this.gl,
      program: this.programs.getProgram(this.programs.activeProgramId)!,
    }, { name }, matrix);
  }

  createFloatUniformHandler(name: LocationName, val?: NumVal): FloatUniformHandler {
    return new FloatUniformHandler({
      gl: this.gl,
      program: this.programs.getProgram(this.programs.activeProgramId)!,
    }, { name }, val);
  }

  createVectorUniformHandler(name: LocationName, vector: Vector): VectorUniformHandler {
    return new VectorUniformHandler({
      gl: this.gl,
      program: this.programs.getProgram(this.programs.activeProgramId)!,
    }, { name }, vector);
  }

  #drawElementsInstanced(vertexCount: GLsizei, instances: GLsizei) {
    this.gl.drawElementsInstanced(
      GL.TRIANGLES,
      vertexCount,
      GL.UNSIGNED_SHORT,
      0,
      instances);
  }
}
