import { TextureSize } from "./TexturePosition";
import { MAX_TEXTURE_SIZE, MIN_TEXTURE_SIZE } from "./TextureSlot";

//  This returns the smallest size that is a power of 2 and is larger than the given size
export function getMinTextureSlotSize(size: number): TextureSize {
  return Math.max(MIN_TEXTURE_SIZE, Math.pow(2, Math.ceil(Math.log(size) / Math.log(2))));
}

//  This rearranges the 'count' sprites into various sprite sheets
export function getFlexSizes(w: number, h: number, count: number) {
  if (count < 1) {
    throw new Error("Invalid count");
  }
  const wFixed = getMinTextureSlotSize(w), hFixed = getMinTextureSlotSize(h);
  const flexSizes: Map<TextureSize, TextureSize> = new Map();
  let wSize = MIN_TEXTURE_SIZE;

  for (let i = 1; i <= count; i++) {
    wSize = getMinTextureSlotSize(wFixed * i);
    const hSize = getMinTextureSlotSize(hFixed * Math.ceil(count / i));
    flexSizes.set(wSize, hSize);
  }
  for (let size = wSize; size <= MAX_TEXTURE_SIZE; size *= 2) {
    if (!flexSizes.has(size)) {
      flexSizes.set(size, hFixed);
    }
  }
  return flexSizes;
}
