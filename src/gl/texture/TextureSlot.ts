import { TextureIndex } from "./TextureManager";
import { TexturePosition, TextureSize } from "./TexturePosition";

export const MAX_TEXTURE_SIZE = 4096;
export const MIN_TEXTURE_SIZE = 16;

export interface Slot {
  readonly size: [TextureSize, TextureSize];
  readonly slotNumber: number;
}

export function calculateTextureIndex({ size, slotNumber }: Slot): TextureIndex {
  const [w, h] = size;
  const slotsPerTexture = (MAX_TEXTURE_SIZE / w) * (MAX_TEXTURE_SIZE / h);
  return Math.floor(slotNumber / slotsPerTexture) as TextureIndex;
}

export function calculatePosition(slot: Slot) {
  const { size, slotNumber } = slot;
  const [w, h] = size;
  const slotsPerRow = MAX_TEXTURE_SIZE / w;
  const slotsPerColumn = MAX_TEXTURE_SIZE / h;
  const x = (slotNumber % slotsPerRow) * w;
  const y = (Math.floor(slotNumber / slotsPerRow) % slotsPerColumn) * h;
  return { x, y, size: size, textureIndex: calculateTextureIndex(slot) };
}

export class TextureSlot implements Slot {
  readonly size: [TextureSize, TextureSize];
  readonly slotNumber: number;
  readonly parent?: TextureSlot;
  sibbling?: TextureSlot;

  constructor(size: [TextureSize, TextureSize], slotNumber: number, parent?: TextureSlot) {
    this.size = size;
    this.slotNumber = slotNumber;
    this.parent = parent;
    this.sibbling = undefined;
  }

  getTag() {
    return TextureSlot.getTag(this);
  }

  static getTag(slot: Slot) {
    return `${slot.size[0]}x${slot.size[1]}-#${slot.slotNumber}`;
  }

  getTextureIndex(): number {
    return calculateTextureIndex(this);
  }

  getTexturePosition(): TexturePosition {
    return calculatePosition(this);
  }

  static positionToTextureSlot(position: TexturePosition, parent?: TextureSlot): TextureSlot {
    const { x, y, size, textureIndex } = position;
    const [w, h] = size;
    const slotsPerRow = MAX_TEXTURE_SIZE / w;
    const slotsPerTexture = (MAX_TEXTURE_SIZE / w) * (MAX_TEXTURE_SIZE / h);
    const slotNumber = slotsPerTexture * textureIndex + (y / h) * slotsPerRow + (x / w);
    return new TextureSlot(size, slotNumber, parent);
  }

  canSplitHorizontally(minHeight: number = MIN_TEXTURE_SIZE) {
    const [, h] = this.size;
    return h > minHeight;
  }

  canSplitVertically(minWidth: number = MIN_TEXTURE_SIZE) {
    const [w,] = this.size;
    return w > minWidth;
  }

  splitHorizontally(): [TextureSlot, TextureSlot] {
    const { x, y, size, textureIndex } = this.getTexturePosition();
    const [w, h] = size;
    if (w <= MIN_TEXTURE_SIZE) {
      throw new Error(`Cannot split texture slot of size ${w} horizontally`);
    }
    const halfWidth = w / 2;
    const left = TextureSlot.positionToTextureSlot({ x, y, size: [halfWidth, h], textureIndex }, this);
    const right = TextureSlot.positionToTextureSlot({ x: x + halfWidth, y, size: [halfWidth, h], textureIndex }, this);
    left.sibbling = right;
    right.sibbling = left;
    return [left, right];
  }

  splitVertically(): [TextureSlot, TextureSlot] {
    const { x, y, size, textureIndex } = this.getTexturePosition();
    const [w, h] = size;
    if (w <= MIN_TEXTURE_SIZE) {
      throw new Error(`Cannot split texture slot of size ${w} vertically`);
    }
    const halfHeight = h / 2;
    const top = TextureSlot.positionToTextureSlot({ x, y, size: [w, halfHeight], textureIndex }, this);
    const bottom = TextureSlot.positionToTextureSlot({ x, y: y + halfHeight, size: [w, halfHeight], textureIndex }, this);
    top.sibbling = bottom;
    bottom.sibbling = top;
    return [top, bottom];
  }
}
