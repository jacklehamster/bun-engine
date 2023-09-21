import { GLPrograms } from "./gl/programs/GLPrograms";
import { Disposable } from "./disposable/Disposable";
import { VertexArray } from "./gl/VertexArray";
import { GLAttributeBuffers } from "./gl/attributes/GLAttributeBuffers";
import { GLUniforms } from "./gl/uniforms/GLUniforms";
import { POSITION_LOC } from "./gl/attributes/Contants";

const DEFAULT_ATTRIBUTES = {
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

const MAX_TRIANGLES = 10000;

function glProxy(gl: WebGL2RenderingContext) {
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

    constructor(canvas: HTMLCanvasElement, attributes?: any) {
        super();
        this.gl = glProxy(canvas.getContext("webgl2", {...DEFAULT_ATTRIBUTES, ...attributes})!);



        this.programs = this.own(new GLPrograms(this.gl));
        this.attributeBuffers = this.own(new GLAttributeBuffers(this.gl, this.programs));
        this.uniforms = this.own(new GLUniforms(this.gl, this.programs));
    }

    initialize() {
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.attributeBuffers.createBuffer(POSITION_LOC);
        const bufferInfo = this.attributeBuffers.getAttributeBuffer(POSITION_LOC);
        this.attributeBuffers.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, bufferInfo);
        this.gl.vertexAttribPointer(bufferInfo.location, 3,
            WebGL2RenderingContext.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(bufferInfo.location);

        // this.bindVertexArray();
        this.attributeBuffers.bufferData(
            WebGL2RenderingContext.ARRAY_BUFFER,
            POSITION_LOC,
            undefined,
            3 * 3 * MAX_TRIANGLES * Float32Array.BYTES_PER_ELEMENT,
            WebGL2RenderingContext.STATIC_DRAW
        );
    }

    updateTrianglePosition(index: number, vertices: number[]) {
        const bufferInfo = this.attributeBuffers.getAttributeBuffer(POSITION_LOC);
        this.attributeBuffers.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, bufferInfo);
        this.attributeBuffers.bufferSubData(WebGL2RenderingContext.ARRAY_BUFFER,
            Float32Array.from(vertices),
            index * 3 * 3 * Float32Array.BYTES_PER_ELEMENT);
    }

    draw(count: GLsizei) {
        this.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
        this.gl.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, count);
    }

    private bindVertexArray() {
        this.own(new VertexArray(this.gl));
    }
}
