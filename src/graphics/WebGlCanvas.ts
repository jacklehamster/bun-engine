import { logProxy } from "@dobuki/log-proxy";
import { GL } from "gl/attributes/Constants";

const DEFAULT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: true,
  antialias: true,
  depth: true,
  failIfMajorPerformanceCaveat: undefined,
  powerPreference: 'default',
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  stencil: false,
};

interface Props {
  attributes: WebGLContextAttributes;
}

interface Config {
  logGL: boolean;
}

export class WebGlCanvas {
  readonly gl: GL;
  constructor(public canvas: HTMLCanvasElement, { attributes }: Partial<Props> = {}, config?: Partial<Config>) {
    const gl: WebGL2RenderingContext = canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })! as WebGL2RenderingContext;
    this.gl = config?.logGL ? logProxy(gl, "gl") : gl;
    canvas.style.pointerEvents = 'none';
  }
}
