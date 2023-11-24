// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { GLPrograms } from './gl/programs/GLPrograms';
import { Disposable } from './disposable/Disposable';
import { VertexArray } from './gl/VertexArray';
import { GLAttributeBuffers } from './gl/attributes/GLAttributeBuffers';
import { GLUniforms } from './gl/uniforms/GLUniforms';
import {
  GL,
  POSITION_TEX_LOC,
  INDEX_LOC,
  TRANSFORM_LOC,
  SLOT_SIZE_LOC,
  CAM_LOC,
  MAX_TEXTURE_SIZE_LOC,
} from './gl/attributes/Contants';
import { TextureManager } from './gl/texture/TextureManager';
import { ImageManager } from 'gl/texture/ImageManager';
import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { replaceTilda } from 'gl/utils/replaceTilda';
import Matrix from 'gl/transform/Matrix';
import { GLCamera } from 'gl/camera/GLCamera';
//import { TextureSlotAllocator } from 'gl/texture/TextureSlotAllocator';
import { TextureSlotAllocator } from 'texture-slot-allocator/src';

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

export class GLEngine extends Disposable {
  gl: GL;
  programs: GLPrograms;
  attributeBuffers: GLAttributeBuffers;
  uniforms: GLUniforms;
  canvas: HTMLCanvasElement;

  textureManager: TextureManager;
  textureAllocator: TextureSlotAllocator
  imageManager: ImageManager;
  camera: GLCamera;

  constructor(canvas: HTMLCanvasElement, attributes?: WebGLContextAttributes) {
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

    this.textureManager = new TextureManager(this.gl);
    this.textureAllocator = new TextureSlotAllocator();
    this.imageManager = new ImageManager();
    this.camera = new GLCamera(this.gl, this.uniforms);

    window.addEventListener('resize', this.checkCanvasSize.bind(this));
  }

  checkCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth * 2;
    this.canvas.height = this.canvas.offsetHeight * 2;
    this.gl.viewport(
      0,
      0,
      this.gl.drawingBufferWidth,
      this.gl.drawingBufferHeight,
    );
    const ratio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;

    this.camera.configOrthoMatrix(ratio);
    this.camera.configPerspectiveMatrix(ratio);
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

    console.log(performance.now(), 11);
    this.programs.useProgram(PROGRAM_NAME);
    console.log(this.uniforms.getUniformLocation(CAM_LOC));

    console.log(performance.now(), 22);
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

    console.log(performance.now(), 33);
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
      const location = POSITION_TEX_LOC;
      this.attributeBuffers.createBuffer(location);
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(location);
      this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
      this.gl.vertexAttribPointer(
        bufferInfo.location,
        4,
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
          -1, -1, 0, 1,
          1, -1, 1, 1,
          1, 1, 1, 0,
          -1, 1, 0, 0,
        ]),
        0,
        GL.STATIC_DRAW,
      );
    }
    console.log(performance.now(), 44);

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
      this.attributeBuffers.bufferData(
        GL.ARRAY_BUFFER,
        location,
        Float32Array.from([
          //  face wall
          ...Matrix.create().translate(0, 0, 0).getMatrix(),
          //  left wall
          ...Matrix.create().translate(-1, 0, 1).rotateY(Math.PI / 2).scale(1, 1, 1).getMatrix(),
          //  right wall
          ...Matrix.create().translate(1, 0, 1).rotateY(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
          //  ground

          //  floor
          ...Matrix.create().translate(0, -1, 1).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
          ...Matrix.create().translate(0, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
          ...Matrix.create().translate(-2, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),
          ...Matrix.create().translate(2, -1, 3).rotateX(-Math.PI / 2).scale(1, 1, 1).getMatrix(),

          //  sprite
          ...Matrix.create().translate(0, 0, 0).getMatrix(),
        ]),
        0,
        GL.DYNAMIC_DRAW,
      );

      const loc = this.uniforms.getUniformLocation(MAX_TEXTURE_SIZE_LOC);
      if (loc) {
        this.gl.uniform1f(loc, this.textureAllocator.maxTextureSize);
      }

      console.log(performance.now(), 55);
    }

    await this.loadLogoTexture();

    this.checkCanvasSize();
    this.camera.refresh();
  }

  syncHud() {
    this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, this.attributeBuffers.getAttributeBuffer(TRANSFORM_LOC));

    const cameraPosition = [
      -this.camera.cameraMatrix[12],
      -this.camera.cameraMatrix[13],
      -this.camera.cameraMatrix[14]
    ];

    // Create a copy of camTurnMatrix and invert it
    const invertedCamTurnMatrix = Matrix.create().copy(this.camera.camTurnMatrix).invert().getMatrix();
    const invertedCamTiltMatrix = Matrix.create().copy(this.camera.camTiltMatrix).invert().getMatrix();

    this.attributeBuffers.bufferSubData(
      GL.ARRAY_BUFFER,
      Float32Array.from([
        //  sprite
        ...Matrix.create()
          .translate(cameraPosition[0], cameraPosition[1], cameraPosition[2])
          .multiply(invertedCamTurnMatrix)
          .multiply(invertedCamTiltMatrix)
          .translate(0, 0, -2)
          .getMatrix()
      ]),
      (4 * 4 * Float32Array.BYTES_PER_ELEMENT) * 7,
    );
  }

  async loadLogoTexture() {
    const maxTextureSize = this.textureAllocator.maxTextureSize;
    const TEXTURE_SLOT_SIZE = maxTextureSize;
    const LOGO_SIZE = maxTextureSize / 4;
    await this.imageManager.drawImage('logo', (ctx) => {
      const { canvas } = ctx;
      canvas.width = LOGO_SIZE;
      canvas.height = LOGO_SIZE;
      const centerX = canvas.width / 2, centerY = canvas.height / 2;
      const halfSize = canvas.width / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = '#ddd';
      ctx.lineWidth = canvas.width / 50;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'gold';

      //  face
      ctx.beginPath();
      ctx.arc(centerX, centerY, halfSize * 0.8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      //  smile
      ctx.beginPath();
      ctx.arc(centerX, centerY, halfSize * 0.5, 0, Math.PI);
      ctx.stroke();

      //  left eye
      ctx.beginPath();
      ctx.arc(canvas.width / 3, canvas.height / 3, halfSize * 0.1, 0, Math.PI, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc((canvas.width / 3) * 2, canvas.height / 3, halfSize * 0.1, 0, Math.PI * 2, true);
      ctx.stroke();
    });

    await this.imageManager.drawImage('ground', (ctx) => {
      const { canvas } = ctx;
      canvas.width = LOGO_SIZE;
      canvas.height = LOGO_SIZE;
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = '#ddd';
      ctx.lineWidth = canvas.width / 50;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'silver';

      //  face
      ctx.beginPath();
      ctx.rect(canvas.width * .2, canvas.height * .2, canvas.width * .6, canvas.height * .6);
      ctx.fill();
      ctx.stroke();
    });

    console.log(performance.now(), 1);
    const slot = this.textureAllocator.allocate(TEXTURE_SLOT_SIZE, TEXTURE_SLOT_SIZE);
    const logoMediaInfo = this.imageManager.getMedia('logo');
    console.log(performance.now(), 2);
    this.textureManager.applyImageToSlot(logoMediaInfo, slot)
    console.log(performance.now(), 3);

    const groundSlot = this.textureAllocator.allocate(TEXTURE_SLOT_SIZE, TEXTURE_SLOT_SIZE);
    console.log(performance.now(), 4);
    const groundMediaInfo = this.imageManager.getMedia('ground');
    console.log(performance.now(), 5);
    this.textureManager.applyImageToSlot(groundMediaInfo, groundSlot)
    console.log(performance.now(), 6);

    console.log(slot, groundSlot);

    console.log(performance.now(), 7);
    this.textureManager.generateMipMap("TEXTURE0");

    {
      const location = SLOT_SIZE_LOC;
      this.attributeBuffers.createBuffer(location);
      const bufferInfo = this.attributeBuffers.getAttributeBuffer(location);
      this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
      const loc = bufferInfo.location;
      this.gl.vertexAttribPointer(
        loc,
        3,
        GL.FLOAT,
        false,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0,
      );
      this.gl.enableVertexAttribArray(loc);
      this.gl.vertexAttribDivisor(loc, 1);
      this.attributeBuffers.bufferData(
        GL.ARRAY_BUFFER,
        location,
        Float32Array.from([
          ...slot.size, slot.slotNumber,
          ...slot.size, slot.slotNumber,
          ...slot.size, slot.slotNumber,

          ...groundSlot.size, groundSlot.slotNumber,
          ...groundSlot.size, groundSlot.slotNumber,
          ...groundSlot.size, groundSlot.slotNumber,
          ...groundSlot.size, groundSlot.slotNumber,

          ...slot.size, slot.slotNumber,
        ]),
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

  refresh() {
    this.gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    const vertexCount = 6;
    const instanceCount = 8;
    this.syncHud();
    this.drawElementsInstanced(vertexCount, instanceCount);
  }

  bindVertexArray() {
    return this.own(new VertexArray(this.gl));
  }
}
