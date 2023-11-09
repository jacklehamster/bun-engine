// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { GLPrograms } from './gl/programs/GLPrograms';
import { Disposable } from './disposable/Disposable';
import { VertexArray } from './gl/VertexArray';
import { GLAttributeBuffers } from './gl/attributes/GLAttributeBuffers';
import { GLUniforms } from './gl/uniforms/GLUniforms';
import {
  POSITION_LOC,
  INDEX_LOC,
  TRANSFORM_LOC,
  TEX_LOC,
  CAM_LOC,
  GL,
  SLOT_SIZE_LOC,
} from './gl/attributes/Contants';
import { mat4, quat, vec3 } from 'gl-matrix';
import { TextureManager } from './gl/texture/TextureManager';
import vertexShader from 'generated/src/gl/resources/vertexShader.txt';
import fragmentShader from 'generated/src/gl/resources/fragmentShader.txt';
import { replaceTilda } from 'gl/utils/replaceTilda';
import Matrix from 'gl/transform/Matrix';

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
  private gl: GL;
  private perspectiveLevel: number = 1;
  programs: GLPrograms;
  attributeBuffers: GLAttributeBuffers;
  uniforms: GLUniforms;
  cameraMatrix: mat4;
  camTurnMatrix: mat4;
  perspectiveMatrix: mat4;
  orthoMatrix: mat4;
  projectionMatrix: mat4;
  canvas: HTMLCanvasElement;

  textureManager: TextureManager;

  constructor(canvas: HTMLCanvasElement, attributes?: WebGLContextAttributes) {
    super();
    this.gl = glProxy(
      canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })!,
    );
    this.canvas = canvas;

    this.textureManager = new TextureManager(this.gl);

    this.programs = this.own(new GLPrograms(this.gl));
    this.attributeBuffers = this.own(
      new GLAttributeBuffers(this.gl, this.programs),
    );
    this.uniforms = this.own(new GLUniforms(this.gl, this.programs));
    this.cameraMatrix = mat4.translate(
      mat4.create(),
      mat4.identity(mat4.create()),
      vec3.fromValues(0, 0, -1),
    );
    this.camTurnMatrix = mat4.identity(mat4.create());
    this.perspectiveMatrix = mat4.identity(mat4.create());
    this.orthoMatrix = mat4.identity(mat4.create());
    this.projectionMatrix = mat4.identity(mat4.create());

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

    this.configOrthoMatrix(ratio);
    this.configPerspectiveMatrix(ratio);
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
    this.gl.depthFunc(GL.LEQUAL);
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
        3,
        GL.FLOAT,
        false,
        0,
        0,
      );
      this.gl.enableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.bufferData(
        GL.ARRAY_BUFFER,
        location,
        Float32Array.from([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]),
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
      this.attributeBuffers.bufferData(
        GL.ARRAY_BUFFER,
        location,
        Float32Array.from([
          // ...mat4.translate(mat4.create(), mat4.fromYRotation(mat4.create(), Math.PI / 4), vec3.fromValues(0, 0, -2)),
          ...Matrix.create().getMatrix(),
          ...Matrix.create().translate(-1, 0, 1).rotateY(Math.PI / 2).getMatrix(),
          ...Matrix.create().translate(1, 0, 1).rotateY(-Math.PI / 2).getMatrix(),
        ]),
        0,
        GL.DYNAMIC_DRAW,
      );
    }

    {
      const location = TEX_LOC;
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
        Float32Array.from([0, 1, 1, 1, 1, 0, 0, 0]),
        0,
        GL.STATIC_DRAW,
      );
    }

    await this.loadLogoTexture();

    this.checkCanvasSize();
    this.refreshCamera();
  }

  async loadLogoTexture() {
    const TEXTURE_SLOT_SIZE = 512;
    const LOGO_SIZE = 2048;

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
        Float32Array.from([
          TEXTURE_SLOT_SIZE,
          TEXTURE_SLOT_SIZE,
          TEXTURE_SLOT_SIZE,
          TEXTURE_SLOT_SIZE,
          TEXTURE_SLOT_SIZE,
          TEXTURE_SLOT_SIZE,
        ]),
        0,
        GL.DYNAMIC_DRAW,
      );
    }

    await this.textureManager.drawImage('logo', (ctx) => {
      const { canvas } = ctx;
      canvas.width = LOGO_SIZE;
      canvas.height = LOGO_SIZE;
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = '#ddd';
      ctx.lineWidth = canvas.width / 50;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        (canvas.width / 2) * 0.8,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        (canvas.width / 2) * 0.5,
        0,
        Math.PI,
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        canvas.width / 3,
        canvas.height / 3,
        (canvas.width / 2) * 0.1,
        0,
        Math.PI,
        true,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        (canvas.width / 3) * 2,
        canvas.height / 3,
        (canvas.width / 2) * 0.1,
        0,
        Math.PI * 2,
        true,
      );
      ctx.stroke();
    });
    this.textureManager.assignImageToTexture(
      'logo',
      'TEXTURE0',
      [0, 0, LOGO_SIZE, LOGO_SIZE],
      [0, 0, TEXTURE_SLOT_SIZE, TEXTURE_SLOT_SIZE],
    );
    this.textureManager.generateMipMap('TEXTURE0');
  }

  configPerspectiveMatrix(ratio: number) {
    const DEG_TO_RADIANT = Math.PI / 90;
    this.perspectiveMatrix = mat4.perspective(
      mat4.create(),
      45 * DEG_TO_RADIANT,
      ratio,
      0,
      10000,
    );
    this.setPerspective();
  }

  configOrthoMatrix(ratio: number) {
    const size = 1;
    this.orthoMatrix = mat4.ortho(
      mat4.create(),
      -size * ratio,
      size * ratio,
      -size,
      size,
      -100,
      100,
    );
    this.setPerspective();
  }

  refreshCamera() {
    const matrix = mat4.identity(mat4.create());
    mat4.mul(matrix, this.cameraMatrix, matrix);
    mat4.mul(matrix, this.camTurnMatrix, matrix);
    mat4.mul(matrix, this.projectionMatrix, matrix);

    const loc = this.uniforms.getUniformLocation(CAM_LOC);
    if (loc) {
      this.gl.uniformMatrix4fv(loc, false, matrix);
    }
  }

  updateTrianglePosition(index: number, vertices: number[]) {
    const bufferInfo = this.attributeBuffers.getAttributeBuffer(POSITION_LOC);
    this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
    this.attributeBuffers.bufferSubData(
      GL.ARRAY_BUFFER,
      Float32Array.from(vertices),
      index * 4 * 3 * Float32Array.BYTES_PER_ELEMENT,
    );
  }

  setPerspective(level?: number) {
    if (level !== undefined) {
      this.perspectiveLevel = level;
    }
    const o = mat4.create();
    mat4.multiplyScalar(o, this.orthoMatrix, 1 - this.perspectiveLevel);
    const p = mat4.create();
    mat4.multiplyScalar(p, this.perspectiveMatrix, this.perspectiveLevel);
    mat4.copy(this.projectionMatrix, o);
    mat4.add(this.projectionMatrix, this.projectionMatrix, p);
    this.refreshCamera();
  }

  moveCam(x: number, z: number) {
    const q = quat.create();
    mat4.getRotation(q, this.camTurnMatrix);
    quat.invert(q, q);
    const v = vec3.fromValues(-x, 0, z);
    vec3.transformQuat(v, v, q);
    mat4.translate(this.cameraMatrix, this.cameraMatrix, v);
    this.refreshCamera();
  }

  turnCam(angle: number) {
    mat4.rotateY(this.camTurnMatrix, this.camTurnMatrix, angle);
    this.refreshCamera();
  }

  drawArrays(count: GLsizei) {
    this.gl.drawArrays(GL.TRIANGLES, 0, count);
  }

  drawElementsInstanced(vertexCount: GLsizei, instances: GLsizei) {
    this.gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    this.gl.drawElementsInstanced(
      GL.TRIANGLES,
      vertexCount,
      GL.UNSIGNED_SHORT,
      0,
      instances,
    );
  }

  bindVertexArray() {
    return this.own(new VertexArray(this.gl));
  }
}
