import { Destroyable } from 'gl/lifecycle/Disposable';
import { GLPrograms } from '../programs/GLPrograms';
import { GL } from './Constants';
import { VertexArray } from 'gl/attributes/VertexArray';

export interface BufferInfo {
  location: number;
  target: GLenum,
  usage: GLenum;
  buffer: WebGLBuffer;
  enabledVertexAttribArray: (boolean | undefined)[];
  bytesPerInstance: GLsizei;
  instanceCount: number;
  callback?: (index: number) => number;
}

interface BufferInfoProps {
  location: LocationName;
  target: GLenum;
  usage: GLenum;
  vertexAttribPointerRows: 0 | 1 | 4;
  elemCount?: GLint;
  divisor?: GLuint & (0 | 1);
  data?: BufferSource;
  instanceCount?: number;
  callback?: (index: number) => number;
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

  createBuffer({ location, target, usage, vertexAttribPointerRows, elemCount = 0, divisor = 0, callback, instanceCount = 1, data }: BufferInfoProps): BufferInfo {
    this.deleteBuffer(location);
    const bufferBuffer = this.gl.createBuffer();
    if (!bufferBuffer) {
      throw new Error(`Unable to create buffer "${location}"`);
    }
    const bytesPerRow = elemCount * Float32Array.BYTES_PER_ELEMENT;
    const bytesPerInstance = vertexAttribPointerRows * bytesPerRow;
    const bufferInfo = this.bufferRecord[location] = {
      location: this.getAttributeLocation(location),
      target,
      usage,
      buffer: bufferBuffer,
      enabledVertexAttribArray: [],
      bytesPerInstance,
      instanceCount,
      callback,
    };

    this.vertexArray.bind();
    this.gl.bindBuffer(bufferInfo.target, bufferInfo.buffer);

    for (let row = 0; row < vertexAttribPointerRows; row++) {
      const loc = bufferInfo.location + row;
      this.gl.vertexAttribPointer(
        loc,
        elemCount,
        GL.FLOAT,
        false,
        bytesPerInstance,
        row * bytesPerRow);
      this.enableVertexAttribArray(location, row);
      this.gl.vertexAttribDivisor(loc, divisor);
    }

    if (data) {
      this.gl.bufferData(target, data, bufferInfo.usage);
    } else if (callback) {
      this.gl.bufferData(target,
        Float32Array.from(new Array(instanceCount).fill(0)
          .map((_, index) => callback(index))),
        bufferInfo.usage);
    } else if (instanceCount) {
      this.gl.bufferData(target, instanceCount * bytesPerInstance, bufferInfo.usage);
    }

    return bufferInfo;
  }

  ensureSize(location: LocationName, newCount: number) {
    const bufferInfo = this.bufferRecord[location];
    if (bufferInfo && bufferInfo.instanceCount < newCount) {
      this.bindBuffer(location);
      const bufferSize = this.gl.getBufferParameter(GL.ARRAY_BUFFER, GL.BUFFER_SIZE);
      const oldBufferData = new Float32Array(bufferSize / Float32Array.BYTES_PER_ELEMENT);
      this.gl.getBufferSubData(GL.ARRAY_BUFFER, 0, oldBufferData);

      if (bufferInfo.callback) {
        const callback = bufferInfo.callback;
        this.gl.bufferData(bufferInfo.target,
          Float32Array.from(new Array(newCount).fill(0).map((_, index) => callback(index))),
          bufferInfo.usage);
      } else if (newCount) {
        this.gl.bufferData(bufferInfo.target, newCount * bufferInfo.bytesPerInstance, bufferInfo.usage);
      }
      this.gl.bufferSubData(bufferInfo.target, 0, oldBufferData);
      bufferInfo.instanceCount = newCount;
    }
  }

  bindBuffer(location: LocationName) {
    const bufferInfo = this.bufferRecord[location];
    if (bufferInfo) {
      this.vertexArray.bind();
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
