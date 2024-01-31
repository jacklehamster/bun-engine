import { GL, MAX_TEXTURE_SIZE_LOC, TEXTURE_UNIFORM_LOC } from 'gl/attributes/Constants';

const DEFAULT_MAX_TEXTURE_SIZE = 4096;

interface Props {
  gl: GL;
  program: WebGLProgram
}

interface Config {
  textureUniformLoc: string;
  maxTextureSizeLoc: string;
  maxTextureSize: number;
}

export class TextureUniformInitializer {
  static initialize({ gl, program }: Props, { maxTextureSize, textureUniformLoc = TEXTURE_UNIFORM_LOC, maxTextureSizeLoc = MAX_TEXTURE_SIZE_LOC }: Partial<Config> = {}) {
    const maxTextureUniform = gl.getUniformLocation(program, maxTextureSizeLoc);
    gl.uniform1f(maxTextureUniform, maxTextureSize ?? DEFAULT_MAX_TEXTURE_SIZE);

    const maxTextureUnits = gl.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);
    const arrayOfTextureIndex = new Array(maxTextureUnits).fill(null).map((_, index) => index);	//	0, 1, 2, 3... 16
    const texturesUniform = gl.getUniformLocation(program, textureUniformLoc)!;
    gl.uniform1iv(texturesUniform, arrayOfTextureIndex);
  }
}
