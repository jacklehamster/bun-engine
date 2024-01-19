import { GL } from "gl/attributes/Constants";
import { DOMWrap } from "ui/DOMWrap";
import { logProxy } from "utils/LogProxy";

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
  attributes?: WebGLContextAttributes;
}

interface Config {
  logGL: boolean;
}

export class WebGlCanvas extends DOMWrap<HTMLCanvasElement> {
  readonly gl: GL;
  constructor(canvas: HTMLCanvasElement, { attributes }: Props = {}, config?: Partial<Config>) {
    super(canvas);
    const gl: WebGL2RenderingContext = canvas.getContext('webgl2', { ...DEFAULT_ATTRIBUTES, ...attributes })! as WebGL2RenderingContext;
    this.gl = config?.logGL ? logProxy(gl) : gl;
    canvas.style.pointerEvents = 'none';
  }
}
