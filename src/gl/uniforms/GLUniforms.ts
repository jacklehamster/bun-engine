import { GL } from 'gl/attributes/Contants';
import { Disposable } from '../../disposable/Disposable';
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
  ): WebGLUniformLocation | undefined {
    const program = this.programs.getProgram(programId);
    return program
      ? this.gl.getUniformLocation(program, name) ?? undefined
      : undefined;
  }
}
