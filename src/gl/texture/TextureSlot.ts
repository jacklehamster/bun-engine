import { TexturePosition, TextureSize } from "./TexturePosition";

export const MAX_TEXTURE_SIZE = 4096;
export const MIN_TEXTURE_SIZE = 16;

export class TextureSlot {
  size: [TextureSize, TextureSize];
  slotNumber: number;
  used: boolean = false;
  parent?: TextureSlot;
  sibbling?: TextureSlot;

  constructor(size: [TextureSize, TextureSize], slotNumber: number, parent?: TextureSlot) {
    this.size = size;
    this.slotNumber = slotNumber;
    this.parent = parent;
    this.sibbling = undefined;
  }

  getTag() {
    return `${this.size[0]}x${this.size[1]}-#${this.slotNumber}`;
  }

  getTextureIndex(): number {
    const [w, h] = this.size;
    const slotsPerTexture = (MAX_TEXTURE_SIZE / w) * (MAX_TEXTURE_SIZE / h);
    return Math.floor(this.slotNumber / slotsPerTexture);
  }

  getTexturePosition(): TexturePosition {
    const [w, h] = this.size;
    const slotsPerRow = MAX_TEXTURE_SIZE / w;
    const slotsPerColumn = MAX_TEXTURE_SIZE / h;
    const x = (this.slotNumber % slotsPerRow) * w;
    const y = (Math.floor(this.slotNumber / slotsPerRow) % slotsPerColumn) * h;
    return { x, y, size: this.size, textureIndex: this.getTextureIndex() };
  }

  static positionToTextureSlot(position: TexturePosition, parent?: TextureSlot): TextureSlot {
    const { x, y, size, textureIndex } = position;
    const [w, h] = size;
    const slotsPerRow = MAX_TEXTURE_SIZE / w;
    const slotsPerTexture = (MAX_TEXTURE_SIZE / w) * (MAX_TEXTURE_SIZE / h);
    const slotNumber = slotsPerTexture * textureIndex + (y / h) * slotsPerRow + (x / w);
    return new TextureSlot(size, slotNumber, parent);
  }

  canSplitHorizontally() {
    const [, h] = this.size;
    return h > MIN_TEXTURE_SIZE;
  }

  canSplitVertically() {
    const [w,] = this.size;
    return w > MIN_TEXTURE_SIZE;
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
