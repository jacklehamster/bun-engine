import { GL } from 'gl/attributes/Constants';
import { Disposable } from '../../lifecycle/Disposable';
import { GLPrograms } from '../programs/GLPrograms';

export class GLUniforms extends Disposable {
  private gl: GL;
  private programs: GLPrograms;

  constructor(gl: GL, programs: GLPrograms) {
    super();
    this.gl = gl;
    this.programs = programs;
  }

  getUniformLocation(
    name: string,
    programId?: string,
  ): WebGLUniformLocation {
    const program = this.programs.getProgram(programId)!;
    return this.gl.getUniformLocation(program, name)!;
  }
}
