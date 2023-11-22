import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { TextureManager, GL } from './TextureManager';
import "../../test/GLMock";
import "../../test/MockCanvas";

describe('TextureManager', () => {
  let gl: Partial<GL>;
  let textureManager: TextureManager;

  beforeEach(() => {
    // Mock WebGL methods
    gl = {
      createTexture: jest.fn().mockReturnValue({}),
      bindTexture: jest.fn(),
      texImage2D: jest.fn(),
    };

    textureManager = new TextureManager(gl as GL);
  });

  it('should construct properly', () => {
    expect(textureManager).toBeDefined();
    expect(textureManager['gl']).toBe(gl);
    expect(textureManager['tempContext'].imageSmoothingEnabled).toBe(true);
  });

  it('should create a new texture if it does not exist', () => {
    const textureId = 'TEXTURE0';
    textureManager['getTexture'](textureId);

    expect(gl.createTexture).toHaveBeenCalled();
    expect(gl.bindTexture).toHaveBeenCalled();//toHaveBeenCalledWith(GL.TEXTURE_2D, {});
    expect(gl.texImage2D).toHaveBeenCalled();//toHaveBeenCalledWith(GL.TEXTURE_2D, 0, GL.RGBA, /* other arguments */);
    expect(textureManager['textureBuffers'][textureId]).toBeDefined();
  });

  it('should not create a new texture if it already exists', () => {
    const textureId = 'TEXTURE0';
    textureManager['textureBuffers'][textureId] = {};

    textureManager['getTexture'](textureId);

    expect(gl.createTexture).not.toHaveBeenCalled();
  });
});
