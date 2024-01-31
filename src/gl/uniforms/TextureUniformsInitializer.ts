import { GLUniforms } from 'gl/uniforms/GLUniforms';
import { GL, MAX_TEXTURE_SIZE_LOC, TEXTURE_UNIFORM_LOC } from 'gl/attributes/Constants';

interface Props {
  gl: GL;
  uniforms: GLUniforms;
}

interface Config {
  maxTextureSize: number;
}

export class TextureUniformInitializer {
  #gl;
  #uniforms;
  #maxTextureSize;
  constructor({ gl, uniforms }: Props, { maxTextureSize }: Partial<Config> = {}) {
    this.#gl = gl;
    this.#uniforms = uniforms;
    this.#maxTextureSize = maxTextureSize ?? 4096;
  }

  initialize() {
    this.#initTextureUniforms();
    this.#initMaxTexture();
  }

  static initialize(props: Props, config: Partial<Config> = {}): void {
    const initializer = new TextureUniformInitializer(props, config);
    initializer.initialize();
  }

  #initTextureUniforms() {
    const maxTextureUnits = this.#gl.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);
    const arrayOfTextureIndex = new Array(maxTextureUnits).fill(null).map((_, index) => index);	//	0, 1, 2, 3... 16
    const textureUniformLocation = this.#uniforms.getUniformLocation(TEXTURE_UNIFORM_LOC);
    this.#gl.uniform1iv(textureUniformLocation, arrayOfTextureIndex);
  }

  #initMaxTexture() {
    const loc = this.#uniforms.getUniformLocation(MAX_TEXTURE_SIZE_LOC);
    this.#gl.uniform1f(loc, this.#maxTextureSize);
  }
}
