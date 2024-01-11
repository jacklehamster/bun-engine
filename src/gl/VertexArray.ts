import { GL } from './attributes/Constants';

export class VertexArray {
  private gl: GL;
  private triangleArray: WebGLVertexArrayObject | null;

  constructor(gl: GL) {
    this.gl = gl;
    this.triangleArray = gl.createVertexArray();
    gl.bindVertexArray(this.triangleArray);
  }

  destroy(): void {
    this.gl.deleteVertexArray(this.triangleArray);
  }
}
