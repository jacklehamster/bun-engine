import { Disposable } from '../lifecycle/Disposable';
import { GL } from './attributes/Constants';

export class VertexArray extends Disposable {
  private gl: GL;
  private triangleArray: WebGLVertexArrayObject | null;

  constructor(gl: GL) {
    super();
    this.gl = gl;
    this.triangleArray = gl.createVertexArray();
    gl.bindVertexArray(this.triangleArray);
  }

  destroy(): void {
    this.gl.deleteVertexArray(this.triangleArray);
  }
}
