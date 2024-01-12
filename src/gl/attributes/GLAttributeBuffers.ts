import { GLPrograms } from '../programs/GLPrograms';
import { GL } from './Constants';

export interface BufferInfo {
  buffer: WebGLBuffer;
  location: number;
}

export type LocationName = string;

export class GLAttributeBuffers {
  private readonly bufferRecord: Record<LocationName, BufferInfo> = {};
  private readonly gl: GL;
  private readonly programs: GLPrograms;

  constructor(gl: GL, programs: GLPrograms) {
    this.gl = gl;
    this.programs = programs;
  }

  getAttributeLocation(name: string, programId?: string): GLint {
    const program = this.programs.getProgram(programId);
    return program ? this.gl.getAttribLocation(program, name) ?? -1 : -1;
  }

  createBuffer(location: LocationName): BufferInfo {
    this.deleteBuffer(location);
    const bufferBuffer = this.gl?.createBuffer();
    if (!bufferBuffer) {
      throw new Error(`Unable to create buffer "${location}"`);
    }
    const record = {
      buffer: bufferBuffer,
      location: this.getAttributeLocation(location),
    };
    this.bufferRecord[location] = record;
    return record;
  }

  deleteBuffer(location: LocationName) {
    if (this.bufferRecord[location]) {
      this.gl.deleteBuffer(this.bufferRecord[location].buffer);
      delete this.bufferRecord[location];
    }
  }

  getAttributeBuffer(location: LocationName): BufferInfo {
    const attribute = this.bufferRecord[location];
    if (!attribute) {
      throw new Error(
        `Attribute "${location}" not created. Make sure "createBuffer" is called.`,
      );
    }
    return attribute;
  }

  destroy(): void {
    Object.keys(this.bufferRecord).forEach((location) =>
      this.deleteBuffer(location),
    );
  }
}
