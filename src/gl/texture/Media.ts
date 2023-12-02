export type MediaType = "image" | "video" | "canvas" | "draw" | "webcam" | string;

export interface ImageMedia {
  type: "image";
  src: string;
}

export interface VideoMedia {
  type: "video";
  src: string;
  volume?: number;
  fps?: number;
}

export interface CanvasMedia {
  type: "canvas";
  canvas: HTMLCanvasElement | OffscreenCanvas;
}

export interface DrawMedia {
  type: "draw";
  draw: (context: OffscreenCanvasRenderingContext2D) => void;
}

export interface WebcamMedia {
  type: "webcam";
  deviceId?: string;
}

export type Media = ImageMedia | VideoMedia | CanvasMedia | DrawMedia | WebcamMedia;
