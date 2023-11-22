import "../../test/MockMedia";
import "../../test/MockCanvas";
import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { ImageManager } from './ImageManager';
import { MediaInfo } from './MediaInfo';

describe('ImageManager', () => {
  let imageManager: ImageManager;
  let mockMediaInfo: MediaInfo;

  beforeEach(() => {
    imageManager = new ImageManager();
    mockMediaInfo = new MediaInfo(new Image(100, 100));
  });

  it('should check if imageId exists', () => {
    imageManager.setImage('1', mockMediaInfo);
    expect(imageManager.hasImageId('1')).toBe(true);
    expect(imageManager.hasImageId('2')).toBe(false);
  });

  it('should get media by imageId', () => {
    imageManager.setImage('1', mockMediaInfo);
    expect(imageManager.getMedia('1')).toBe(mockMediaInfo);
    expect(imageManager.getMedia('2')).toBeUndefined();
  });

  it('should draw image and add to images', async () => {
    const drawProcedure = jest.fn();
    const imageInfo = await imageManager.drawImage('1', drawProcedure);

    expect(drawProcedure).toHaveBeenCalled();
    expect(imageInfo).toBeInstanceOf(MediaInfo);
    expect(imageManager.getMedia('1')).toBe(imageInfo);
  });

  it('should load canvas and add to images', async () => {
    const canvas = new OffscreenCanvas(1, 1);
    const imageInfo = await imageManager.loadCanvas('1', canvas);

    expect(imageInfo).toBeInstanceOf(MediaInfo);
    expect(imageManager.getMedia('1')).toBe(imageInfo);
  });
});
