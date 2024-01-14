import { GL } from "gl/attributes/Constants";
import { DOMWrap } from "ui/DOMWrap";
import { logProxy } from "utils/LogProxy";

const LOG_GL = false;

const DEFAULT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: true,
  failIfMajorPerformanceCaveat: undefined,
  powerPreference: 'default',
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  stencil: false,
};

export interface Props {
  attributes?: WebGLContextAttributes;
}

export class WebGlCanvas extends DOMWrap<HTMLCanvasElement | OffscreenCanvas> {
  gl: GL;
  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, {
    attributes,
  }: Props = {}) {
    super(canvas);
    const gl: WebGL2RenderingContext = canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })! as WebGL2RenderingContext;
    this.gl = LOG_GL ? logProxy(gl) : gl;
  }
}
