import { Destroyable } from 'gl/lifecycle/Disposable';
import { GLPrograms } from '../programs/GLPrograms';
import { GL } from './Constants';
import { VertexArray } from 'gl/attributes/VertexArray';

export interface BufferInfo {
  location: number;
  target: GLenum,
  buffer: WebGLBuffer;
  enabledVertexAttribArray: (boolean | undefined)[];
}

export type LocationName = string;

export class GLAttributeBuffers implements Destroyable {
  private readonly bufferRecord: Record<LocationName, BufferInfo> = {};
  private readonly vertexArray: VertexArray;

  constructor(private readonly gl: GL, private readonly programs: GLPrograms) {
    this.vertexArray = new VertexArray(this.gl);
  }

  bindVertexArray() {
    this.vertexArray.bind();
  }

  getAttributeLocation(name: string, programId?: string): GLint {
    const program = this.programs.getProgram(programId);
    return program ? this.gl.getAttribLocation(program, name) ?? -1 : -1;
  }

  hasBuffer(location: LocationName): boolean {
    return !!this.bufferRecord[location];
  }

  enableVertexAttribArray(location: LocationName, index: number = 0): void {
    const bufferInfo = this.bufferRecord[location];
    if (!bufferInfo.enabledVertexAttribArray[index]) {
      bufferInfo.enabledVertexAttribArray[index] = true;
      this.gl.enableVertexAttribArray(bufferInfo.location + index);
    }
  }

  disableVertexAttribArray(location: LocationName): void {
    const bufferInfo = this.bufferRecord[location];
    bufferInfo.enabledVertexAttribArray.forEach((enabled, index) => {
      if (enabled) {
        this.gl.disableVertexAttribArray(bufferInfo.location + index);
        bufferInfo.enabledVertexAttribArray[index] = false;
      }
    });
  }

  createBuffer(location: LocationName, target: GLenum): BufferInfo {
    this.deleteBuffer(location);
    const bufferBuffer = this.gl?.createBuffer();
    if (!bufferBuffer) {
      throw new Error(`Unable to create buffer "${location}"`);
    }
    const record = {
      location: this.getAttributeLocation(location),
      target,
      buffer: bufferBuffer,
      enabledVertexAttribArray: [],
    };
    this.bufferRecord[location] = record;
    return record;
  }

  bindBuffer(location: LocationName) {
    const bufferInfo = this.bufferRecord[location];
    if (bufferInfo) {
      this.bindVertexArray();
      this.gl.bindBuffer(bufferInfo.target, bufferInfo.buffer);
    }
  }

  deleteBuffer(location: LocationName) {
    const bufferInfo = this.bufferRecord[location];
    if (bufferInfo) {
      this.disableVertexAttribArray(location);
      this.gl.deleteBuffer(bufferInfo.buffer);
      delete this.bufferRecord[location];
    }
  }

  getAttributeBuffer(location: LocationName): BufferInfo {
    const bufferInfo = this.bufferRecord[location];
    if (!bufferInfo) {
      throw new Error(
        `Attribute "${location}" not created. Make sure "createBuffer" is called.`,
      );
    }
    return bufferInfo;
  }

  clear() {
    Object.keys(this.bufferRecord).forEach((location) =>
      this.deleteBuffer(location),
    );
  }

  destroy(): void {
    this.clear();
  }
}
