import { Core } from "core/Core";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { ICamera } from "gl/camera/ICamera";
import { Auxiliary } from "world/aux/Auxiliary";

export class ResizeAux implements Auxiliary {
  private engine: IGraphicsEngine;
  private camera: ICamera;
  constructor({ engine, camera }: Core) {
    this.engine = engine;
    this.camera = camera;
  }

  activate(): void | (() => void) {
    return this.handleResize();
  }

  private handleResize() {
    const { engine } = this;
    const onResize = (width: number, height: number) => {
      this.camera.configProjectionMatrix(width, height);
    };
    return engine.addResizeListener(onResize);
  }
}
