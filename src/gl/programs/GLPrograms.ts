import { GL } from 'gl/attributes/Constants';
import { Disposable } from '../../lifecycle/Disposable';
import { GLProgram } from './GLProgram';

export class GLPrograms extends Disposable {
  activeProgramId: string = '';
  private gl: GL;
  private programs: Record<string, GLProgram> = {};

  constructor(gl: GL) {
    super();
    this.gl = gl;
  }

  addProgram(id: string, vertex: string, fragment: string) {
    if (this.programs[id]) {
      this.removeProgram(id);
    }
    this.programs[id] = this.own(new GLProgram(this.gl, vertex, fragment));
  }

  useProgram(id: string) {
    if (this.activeProgramId !== id) {
      this.activeProgramId = id;
      this.programs[id].use();
    }
  }

  removeProgram(id: string) {
    this.programs[id].destroy();
    delete this.programs[id];
  }

  getProgram(id?: string): WebGLProgram | undefined {
    return this.programs[id ?? this.activeProgramId]?.program;
  }
}
