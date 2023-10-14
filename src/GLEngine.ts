// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { GLPrograms } from "./gl/programs/GLPrograms";
import { Disposable } from "./disposable/Disposable";
import { VertexArray } from "./gl/VertexArray";
import { GLAttributeBuffers } from "./gl/attributes/GLAttributeBuffers";
import { GLUniforms } from "./gl/uniforms/GLUniforms";
import { POSITION_LOC, INDEX_LOC, TRANSFORM_LOC, CAM_LOC } from "./gl/attributes/Contants";
import { mat4, quat, vec3 } from "gl-matrix";

const DEFAULT_ATTRIBUTES: WebGLContextAttributes = {
    alpha: true,
    antialias: false,
    depth: true,
    desynchronized: true,
    failIfMajorPerformanceCaveat: undefined,
    powerPreference: "default",
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
};

const GL = WebGL2RenderingContext;

const MAX_TRIANGLES = 10000;
const LOG_GL = false;

function glProxy(gl: WebGL2RenderingContext) {
    if (!LOG_GL) {
        return gl;
    }
    const proxy = new Proxy<WebGL2RenderingContext>(gl, {
        get(target, prop) {
            const t = target as any;
            const result = t[prop];
            if (typeof(result) === "function") {
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
};



export class GLEngine extends Disposable {
    private gl: WebGL2RenderingContext;
    programs: GLPrograms;
    attributeBuffers: GLAttributeBuffers;
    uniforms: GLUniforms;
    cameraMatrix: mat4;
    camTurnMatrix: mat4;
    perspectiveMatrix: mat4;
    orthoMatrix: mat4;
    projectionMatrix: mat4;

    constructor(canvas: HTMLCanvasElement, attributes?: WebGLContextAttributes) {
        super();
        this.gl = glProxy(canvas.getContext("webgl2", {...DEFAULT_ATTRIBUTES, ...attributes})!);

        this.programs = this.own(new GLPrograms(this.gl));
        this.attributeBuffers = this.own(new GLAttributeBuffers(this.gl, this.programs));
        this.uniforms = this.own(new GLUniforms(this.gl, this.programs));
        this.cameraMatrix = mat4.translate(mat4.create(), mat4.identity(mat4.create()), vec3.fromValues(0, 0, -1));
        this.camTurnMatrix = mat4.identity(mat4.create());
        this.perspectiveMatrix = mat4.identity(mat4.create());
        this.orthoMatrix = mat4.identity(mat4.create());
        this.projectionMatrix = mat4.identity(mat4.create());
    }

    initialize() {
        //  enable depth
        this.gl.enable(GL.DEPTH_TEST);
        this.gl.depthFunc(GL.LEQUAL);
        //  enable blend
        this.gl.enable(GL.BLEND);
        this.gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        {
            this.attributeBuffers.createBuffer(INDEX_LOC);
            const bufferInfo = this.attributeBuffers.getAttributeBuffer(INDEX_LOC);
            this.attributeBuffers.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, bufferInfo);
            this.attributeBuffers.bufferData(
                GL.ELEMENT_ARRAY_BUFFER,
                INDEX_LOC,
                Uint16Array.from([
                    0, 1, 2,
                    3, 0, 2
                ]),
                0,
                GL.STATIC_DRAW
            );    
        }

        {
            this.attributeBuffers.createBuffer(POSITION_LOC);
            const bufferInfo = this.attributeBuffers.getAttributeBuffer(POSITION_LOC);
            this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
            this.gl.vertexAttribPointer(bufferInfo.location, 3,
                GL.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(bufferInfo.location);    
            this.attributeBuffers.bufferData(
                GL.ARRAY_BUFFER,
                POSITION_LOC,
                Float32Array.from([    
                    1, 1, 0,
                    1, -1, 0,
                    -1, -1, 0,
                    -1, 1, 0,
                ]),
                0,
    //            4 * 3 * MAX_TRIANGLES * Float32Array.BYTES_PER_ELEMENT,
                GL.STATIC_DRAW
            );
        }

        {
            this.attributeBuffers.createBuffer(TRANSFORM_LOC);
            const bufferInfo = this.attributeBuffers.getAttributeBuffer(TRANSFORM_LOC);
            this.attributeBuffers.bindBuffer(GL.ARRAY_BUFFER, bufferInfo);
            for (let i = 0; i < 4; i++) {
                const loc = bufferInfo.location + i;
                this.gl.vertexAttribPointer(loc, 4,
                    GL.FLOAT, false, 4 * 4 * Float32Array.BYTES_PER_ELEMENT, i * 4 * Float32Array.BYTES_PER_ELEMENT);    
                this.gl.enableVertexAttribArray(loc);    
                this.gl.vertexAttribDivisor(loc, 1);
            }
            this.attributeBuffers.bufferData(
                GL.ARRAY_BUFFER,
                TRANSFORM_LOC,
                Float32Array.from([
                    // ...mat4.translate(mat4.create(), mat4.fromYRotation(mat4.create(), Math.PI / 4), vec3.fromValues(0, 0, -2)),
                    ...mat4.fromYRotation(mat4.create(), Math.PI / 4),
                    ...mat4.fromYRotation(mat4.create(), Math.PI / 2),
                    ...mat4.identity(mat4.create()),
                ]),
                0,
                GL.DYNAMIC_DRAW
            );    
        }

        const ratio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
        {
            const DEG_TO_RADIANT = Math.PI / 90;
            this.perspectiveMatrix = mat4.perspective(mat4.create(),
                45 * DEG_TO_RADIANT,
                ratio,
                0,
                10000
              );
        }

        {
            const size = 1;
            this.orthoMatrix = mat4.ortho(mat4.create(),
                -size * ratio,
                size * ratio,
                -size,
                size,
                -100,
                100,
              );
        }

        this.setPerspective(1);

        this.refreshCam();
    }

    refreshCam() {
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
        this.attributeBuffers.bufferSubData(GL.ARRAY_BUFFER,
            Float32Array.from(vertices),
            index * 4 * 3 * Float32Array.BYTES_PER_ELEMENT);
    }

    setPerspective(level: number) {
        const o = mat4.create();
        mat4.multiplyScalar(o, this.orthoMatrix, 1 - level);
        const p = mat4.create();
        mat4.multiplyScalar(p, this.perspectiveMatrix, level);
        mat4.copy(this.projectionMatrix, o);
        mat4.add(this.projectionMatrix, this.projectionMatrix, p);
        this.refreshCam();
    }

    moveCam(x: number, z: number) {
        const q = quat.create();
        mat4.getRotation(q, this.camTurnMatrix);
        quat.invert(q, q);
        const v = vec3.fromValues(-x, 0, z);
        vec3.transformQuat(v, v, q);
        mat4.translate(this.cameraMatrix, this.cameraMatrix, v);
        this.refreshCam();
    }

    turnCam(angle: number) {
        mat4.rotateY(this.camTurnMatrix, this.camTurnMatrix, angle);
        this.refreshCam();
    }

    drawArrays(count: GLsizei) {
        this.gl.drawArrays(GL.TRIANGLES, 0, count);
    }

    drawElementsInstanced(vertexCount: GLsizei, instances: GLsizei) {
        this.gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        this.gl.drawElementsInstanced(GL.TRIANGLES, vertexCount, GL.UNSIGNED_SHORT, 0, instances);
    }

    private bindVertexArray() {
        this.own(new VertexArray(this.gl));
    }
}
