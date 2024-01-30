import { GL } from "gl/attributes/Constants";

export interface Props {
  gl: GL;
  program: WebGLProgram;
}

export interface Config {
  name: string;
}

export abstract class BaseUniformHandler<T> {
  private gl: GL;
  private location: WebGLUniformLocation;
  constructor({ gl, program }: Props, { name }: Config, private updateCall: (gl: GL, location: WebGLUniformLocation, value: T) => void) {
    this.gl = gl;
    this.location = gl.getUniformLocation(program, name)!;
  }

  updateValue(value: T): void {
    this.updateCall(this.gl, this.location, value);
  }

  abstract update(): void;
}
