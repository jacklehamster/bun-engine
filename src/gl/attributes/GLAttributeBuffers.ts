import { Disposable } from '../../lifecycle/Disposable';
import { GLPrograms } from '../programs/GLPrograms';
import { GL } from './Constants';

export interface BufferInfo {
  buffer: WebGLBuffer;
  target?: GLenum;
  location: number;
  bufferArray?: TypedArray;
  bufferSize?: number;
  usage?: GLenum;
}

export type LocationName = string;

export class GLAttributeBuffers extends Disposable {
  private readonly bufferRecord: Record<LocationName, BufferInfo> = {};
  private lastBoundBuffer?: BufferInfo;
  private readonly gl: GL;
  private readonly programs: GLPrograms;

  constructor(gl: GL, programs: GLPrograms) {
    super();
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

  getAttributeBuffer(location: LocationName, autoCreate?: boolean): BufferInfo {
    const attribute = this.bufferRecord[location];
    if (!attribute) {
      if (autoCreate) {
        return this.createBuffer(location);
      }
      throw new Error(
        `Attribute "${location}" not created. Make sure "createBuffer" is called.`,
      );
    }
    return attribute;
  }

  bufferData(
    target: GLenum,
    location: LocationName,
    bufferArray: TypedArray | undefined,
    bufferSize: number,
    glUsage: GLenum,
  ) {
    const bufferInfo = this.getAttributeBuffer(location);
    if (bufferArray) {
      this.gl.bufferData(target, bufferArray, glUsage);
    } else {
      this.gl.bufferData(target, bufferSize, glUsage);
    }
    bufferInfo.bufferSize = bufferSize || bufferArray?.length;
    bufferInfo.bufferArray =
      bufferArray ??
      new Float32Array(
        bufferInfo.bufferSize! / Float32Array.BYTES_PER_ELEMENT,
      ).fill(0);
    bufferInfo.usage = glUsage;
    bufferInfo.target = target;
  }

  bufferSubData(
    target: GLenum,
    bufferArray: TypedArray,
    dstByteOffset: number,
    srcOffset?: number,
    length?: number,
  ) {
    if (srcOffset) {
      this.gl.bufferSubData(
        target,
        dstByteOffset,
        bufferArray,
        srcOffset,
        length,
      );
    } else {
      this.gl.bufferSubData(target, dstByteOffset, bufferArray);
    }
  }

  bindBuffer(target: GLenum, bufferInfo: BufferInfo) {
    if (this.lastBoundBuffer !== bufferInfo) {
      this.lastBoundBuffer = bufferInfo;
      this.gl.bindBuffer(target, bufferInfo.buffer);
    }
  }

  destroy(): void {
    Object.keys(this.bufferRecord).forEach((location) =>
      this.deleteBuffer(location),
    );
  }
}
