import { describe, expect, it } from 'bun:test';
import { getMinTextureSlotSize, getFlexSizes } from './TextureUtils';

describe('TextureUtils', () => {
  describe('getMinTextureSlotSize', () => {
    it('should return the smallest size that is a power of 2 and is larger than the given size', () => {
      expect(getMinTextureSlotSize(20)).toBe(32);
      expect(getMinTextureSlotSize(33)).toBe(64);
      expect(getMinTextureSlotSize(64)).toBe(64);
    });
  });

  describe('getFlexSizes', () => {
    it('should correctly rearrange the sprites into various sprite sheets', () => {
      expect(Array.from(getFlexSizes(20, 30, 3))).toEqual([
        [32, 128], [64, 64], [128, 32], [256, 32],
        [512, 32], [1024, 32], [2048, 32], [4096, 32]
      ]);
      expect(Array.from(getFlexSizes(5, 100, 5))).toEqual([
        [16, 1024], [32, 512], [64, 256], [128, 128], [256, 128], [512, 128],
        [1024, 128], [2048, 128], [4096, 128]
      ]);
    });
  });
});
