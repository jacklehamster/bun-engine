import { beforeEach, describe, expect, it } from 'bun:test';
import { TextureSlot, MIN_TEXTURE_SIZE, MAX_TEXTURE_SIZE } from './TextureSlot';
import { TexturePosition } from "./TexturePosition";

describe('TextureSlot', () => {
  let slot: TextureSlot;

  beforeEach(() => {
    slot = new TextureSlot([2 * MIN_TEXTURE_SIZE, 2 * MIN_TEXTURE_SIZE], 0);
  });

  it('should correctly calculate the texture position', () => {
    const slot = new TextureSlot([2 * MIN_TEXTURE_SIZE, 2 * MIN_TEXTURE_SIZE], 20);
    const slotsPerRow = MAX_TEXTURE_SIZE / (2 * MIN_TEXTURE_SIZE);
    const slotsPerColumn = MAX_TEXTURE_SIZE / (2 * MIN_TEXTURE_SIZE);
    const expectedX = (20 % slotsPerRow) * (2 * MIN_TEXTURE_SIZE);
    const expectedY = (Math.floor(20 / slotsPerColumn) % slotsPerRow) * (2 * MIN_TEXTURE_SIZE);
    const expectedPosition = { x: expectedX, y: expectedY, size: [2 * MIN_TEXTURE_SIZE, 2 * MIN_TEXTURE_SIZE], textureIndex: slot.getTextureIndex() };
    expect(slot.getTexturePosition()).toEqual(expectedPosition);
  });

  it('should correctly convert a position to a texture slot', () => {
    const position: TexturePosition = { x: MIN_TEXTURE_SIZE, y: 2 * MIN_TEXTURE_SIZE, size: [2 * MIN_TEXTURE_SIZE, 2 * MIN_TEXTURE_SIZE], textureIndex: 1 };
    const slot = TextureSlot.positionToTextureSlot(position);
    const slotsPerRow = MAX_TEXTURE_SIZE / (2 * MIN_TEXTURE_SIZE);
    const slotsPerTexture = (MAX_TEXTURE_SIZE / (2 * MIN_TEXTURE_SIZE)) * (MAX_TEXTURE_SIZE / (2 * MIN_TEXTURE_SIZE));
    const expectedSlotNumber = slotsPerTexture * position.textureIndex + (position.y / (2 * MIN_TEXTURE_SIZE)) * slotsPerRow + (position.x / (2 * MIN_TEXTURE_SIZE));
    expect(slot.slotNumber).toBe(expectedSlotNumber);
  });

  it('should split a slot horizontally', () => {
    const [left, right] = slot.splitHorizontally();
    expect(left.getTexturePosition()).toEqual({ x: 0, y: 0, size: [MIN_TEXTURE_SIZE, 2 * MIN_TEXTURE_SIZE], textureIndex: 0 });
    expect(right.getTexturePosition()).toEqual({ x: MIN_TEXTURE_SIZE, y: 0, size: [MIN_TEXTURE_SIZE, 2 * MIN_TEXTURE_SIZE], textureIndex: 0 });
    expect(left.sibbling).toBe(right);
    expect(right.sibbling).toBe(left);
  });

  it('should split a slot vertically', () => {
    const [top, bottom] = slot.splitVertically();
    expect(top.getTexturePosition()).toEqual({ x: 0, y: 0, size: [2 * MIN_TEXTURE_SIZE, MIN_TEXTURE_SIZE], textureIndex: 0 });
    expect(bottom.getTexturePosition()).toEqual({ x: 0, y: MIN_TEXTURE_SIZE, size: [2 * MIN_TEXTURE_SIZE, MIN_TEXTURE_SIZE], textureIndex: 0 });
    expect(top.sibbling).toBe(bottom);
    expect(bottom.sibbling).toBe(top);
  });

  it('should throw an error when trying to split a slot that is too small', () => {
    const smallSlot = new TextureSlot([MIN_TEXTURE_SIZE, MIN_TEXTURE_SIZE], 0);
    expect(() => smallSlot.splitHorizontally()).toThrow(`Cannot split texture slot of size ${MIN_TEXTURE_SIZE} horizontally`);
    expect(() => smallSlot.splitVertically()).toThrow(`Cannot split texture slot of size ${MIN_TEXTURE_SIZE} vertically`);
  });
});
