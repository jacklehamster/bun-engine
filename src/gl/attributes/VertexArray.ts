import { GL } from './Constants';

export class VertexArray {
  private triangleArray: WebGLVertexArrayObject | null;

  constructor(private gl: GL) {
    this.triangleArray = this.gl.createVertexArray();
  }

  bind() {
    this.gl.bindVertexArray(this.triangleArray);
  }

  destroy(): void {
    this.gl.deleteVertexArray(this.triangleArray);
    this.triangleArray = null;
  }
}
