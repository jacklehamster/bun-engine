import "../../test/MockMedia";
import "../../test/MockCanvas";
import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { ImageManager } from './ImageManager';
import { MediaData } from './MediaData';

describe('ImageManager', () => {
  let imageManager: ImageManager;
  let mockMediaInfo: MediaData;

  beforeEach(() => {
    imageManager = new ImageManager();
    mockMediaInfo = new MediaData(0, new Image(100, 100));
  });

  it('should draw image and add to images', async () => {
    const drawProcedure = jest.fn();
    const imageInfo = await imageManager.drawImage(1, drawProcedure);

    expect(drawProcedure).toHaveBeenCalled();
    expect(imageInfo).toBeInstanceOf(MediaData);
  });

  it('should load canvas and add to images', async () => {
    const canvas = new OffscreenCanvas(1, 1);
    const imageInfo = await imageManager.loadCanvas(1, canvas);

    expect(imageInfo).toBeInstanceOf(MediaData);
  });
});
