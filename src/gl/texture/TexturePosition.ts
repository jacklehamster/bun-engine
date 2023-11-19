export type TextureSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | number;



export interface TexturePosition {
  x: number;
  y: number;
  size: [TextureSize, TextureSize];
  textureIndex: number;
}
