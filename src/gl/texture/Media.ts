import { MediaId } from "./ImageManager";

export type MediaType = "image" | "video" | "canvas" | "draw" | "webcam" | string;

interface BaseMedia {
  id: MediaId;
}

export interface ImageMedia extends BaseMedia {
  type: "image";
  src: string;
}

export interface VideoMedia extends BaseMedia {
  type: "video";
  src: string;
  volume?: number;
  fps?: number;
  playSpeed?: number;
}

export interface CanvasMedia extends BaseMedia {
  type: "canvas";
  canvas: HTMLCanvasElement | OffscreenCanvas;
}

export interface DrawMedia extends BaseMedia {
  type: "draw";
  draw: (context: OffscreenCanvasRenderingContext2D) => void;
}

export interface WebcamMedia extends BaseMedia {
  type: "webcam";
  deviceId?: string;
}

export type Media = ImageMedia | VideoMedia | CanvasMedia | DrawMedia | WebcamMedia;
