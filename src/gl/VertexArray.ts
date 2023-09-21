import { Disposable } from "../disposable/Disposable";

export class VertexArray extends Disposable {
    private gl: WebGL2RenderingContext;
    private triangleArray: WebGLVertexArrayObject | null;

    constructor(gl: WebGL2RenderingContext) {
        super();
        this.gl = gl;
        this.triangleArray = gl.createVertexArray();
        gl.bindVertexArray(this.triangleArray);
    }
    
    destroy(): void {
        this.gl.deleteVertexArray(this.triangleArray);
    }
}