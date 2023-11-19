import { TextureSlotAllocator } from './TextureSlotAllocator';
import { TextureSlot } from './TextureSlot';
import { beforeEach, describe, expect, it } from 'bun:test';

describe('TextureSlotAllocator', () => {
  let allocator: TextureSlotAllocator;

  beforeEach(() => {
    allocator = new TextureSlotAllocator(1);
  });

  it('should correctly allocate and deallocate small slots', () => {
    // Allocate a 1st small slot.
    const slot1 = allocator.allocate(20, 5);
    expect(slot1.size).toEqual([32, 16]);

    // Allocate a 2nd small slot.
    const slot2 = allocator.allocate(20, 5);
    expect(slot2.size).toEqual([32, 16]);

    // Deallocate the 1st small slot.
    allocator.deallocate(slot1);

    // Deallocate the 2nd small slot.
    allocator.deallocate(slot2);

    expect(allocator.textureSlots.size).toBe(1);
    expect(allocator.textureSlots.at(0)!.key!.size).toEqual([4096, 4096]);
  });

  it('should correctly allocate and deallocate slots of various sizes', () => {
    // Allocate a 1st small slot.
    const slot1 = allocator.allocate(20, 5);
    expect(slot1.size).toEqual([32, 16]);

    // Allocate a 2nd small slot.
    const slot2 = allocator.allocate(500, 500);
    expect(slot2.size).toEqual([512, 512]);

    // Deallocate the 1st small slot.
    allocator.deallocate(slot1);

    // Deallocate the 2nd small slot.
    allocator.deallocate(slot2);

    expect(allocator.textureSlots.size).toBe(1);
    expect(allocator.textureSlots.at(0)!.key!.size).toEqual([4096, 4096]);
  });


  it('should correctly allocate and deallocate spritesheets', () => {
    // Allocate a 1st small slot.
    const slot1 = allocator.allocate(50, 20, 5);
    expect(slot1.size).toEqual([128, 128]);

    // Allocate a 2nd small slot.
    const slot2 = allocator.allocate(20, 5, 10);
    expect(slot2.size).toEqual([64, 128]);

    // Deallocate the 1st small slot.
    allocator.deallocate(slot1);

    // Deallocate the 2nd small slot.
    allocator.deallocate(slot2);

    expect(allocator.textureSlots.size).toBe(1);
    expect(allocator.textureSlots.at(0)!.key!.size).toEqual([4096, 4096]);
  });
});
