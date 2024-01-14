import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { ICamera } from "camera/ICamera";
import { Auxiliary } from "world/aux/Auxiliary";
import { DOMWrap } from "ui/DOMWrap";

interface Props {
  engine: IGraphicsEngine;
  camera: ICamera;
}

export class ResizeAux implements Auxiliary<DOMWrap<HTMLCanvasElement>> {
  private engine: IGraphicsEngine;
  private camera: ICamera;
  private canvas?: HTMLCanvasElement;

  constructor({ engine, camera }: Props) {
    this.engine = engine;
    this.camera = camera;
    this.onResize = this.onResize.bind(this);
  }

  set holder(value: DOMWrap<HTMLCanvasElement>) {
    this.canvas = value.elem;
  }

  activate(): void {
    window.addEventListener('resize', this.onResize);
    this.checkCanvasSize();
  }

  deactivate(): void {
    window.removeEventListener('resize', this.onResize);
  }

  onResize() {
    this.checkCanvasSize();
  }

  checkCanvasSize(): void {
    if (this.canvas) {
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.width = this.canvas.offsetWidth * 2;
        this.canvas.height = this.canvas.offsetHeight * 2;
      }
      this.camera?.resizeViewport(this.canvas.width, this.canvas.height);
      this.engine.resetViewportSize();
    }
  }
}
