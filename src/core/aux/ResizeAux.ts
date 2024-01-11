import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { ICamera } from "gl/camera/ICamera";
import { Auxiliary } from "world/aux/Auxiliary";

interface Props {
  engine: IGraphicsEngine;
}

export class ResizeAux implements Auxiliary<ICamera> {
  private engine: IGraphicsEngine;
  private camera?: ICamera;
  constructor({ engine }: Props) {
    this.engine = engine;
  }

  set holder(value: ICamera | undefined) {
    this.camera = value;
  }

  activate(): void {
    this.handleResize();
  }

  deactivate(): void {
    this.removeListener?.();
    this.removeListener = undefined;
  }

  private removeListener?(): void;
  private handleResize() {
    const { engine } = this;
    const onResize = (width: number, height: number) => {
      this.camera?.configProjectionMatrix(width, height);
    };
    this.removeListener = engine.addResizeListener(onResize);
  }
}
