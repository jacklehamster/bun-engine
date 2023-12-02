import { Update } from "./Update";
import { Camera, CameraMatrixType } from "gl/camera/Camera";
import { GraphicsEngine } from "../core/GraphicsEngine";

export class CameraUpdate implements Update {
  constructor(private type: CameraMatrixType, private camera: Camera, private engine: GraphicsEngine) {
  }

  update(): void {
    const { camera, engine } = this;
    engine.updateCameraMatrix(this.type, camera.getCameraMatrix(this.type));
  }
}
