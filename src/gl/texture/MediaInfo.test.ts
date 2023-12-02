import "../../test/MockMedia";
import { describe, expect, it } from 'bun:test';
import { MediaData } from './MediaData';


describe('MediaInfo', () => {
  it('should construct properly with HTMLImageElement', () => {
    const image = new Image(100, 200);
    const mediaInfo = new MediaData(image);

    expect(mediaInfo.texImgSrc).toBe(image);
    expect(mediaInfo.width).toBe(100);
    expect(mediaInfo.height).toBe(200);
  });

  it('should construct properly with VideoFrame', () => {
    const videoFrame = new VideoFrame(new Image(300, 400));
    const mediaInfo = new MediaData(videoFrame as any);

    expect(mediaInfo.texImgSrc).toBe(videoFrame);
    expect(mediaInfo.width).toBe(300);
    expect(mediaInfo.height).toBe(400);
  });

  it('should construct properly with other TexImageSource', () => {
    const texImageSource = {
      width: 600,
      height: 700,
    };
    const mediaInfo = new MediaData(texImageSource as any);

    expect(mediaInfo.texImgSrc).toBe(texImageSource);
    expect(mediaInfo.width).toBe(600);
    expect(mediaInfo.height).toBe(700);
  });

  it('should throw error for invalid image', () => {
    const invalidImage = {};
    expect(() => new MediaData(invalidImage as any)).toThrow('Invalid image');
  });


  it('should create MediaInfo from canvas', () => {
    const canvas = {
      width: 100,
      height: 200,
    };
    const mediaInfo = MediaData.createFromCanvas(canvas as any);

    expect(mediaInfo.texImgSrc).toBe(canvas);
    expect(mediaInfo.width).toBe(100);
    expect(mediaInfo.height).toBe(200);
  });
});
