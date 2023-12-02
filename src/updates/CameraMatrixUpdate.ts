import { Update } from "./Update";
import { CameraMatrixType } from "gl/camera/Camera";
import { GraphicsEngine } from "../core/GraphicsEngine";
import IWorld from "world/IWorld";

export class CameraMatrixUpdate implements Update {
  constructor(private type: CameraMatrixType, private world: IWorld, private engine: GraphicsEngine) {
  }

  update(): void {
    const { world, engine } = this;
    const matrix = world.getCameraMatrix(this.type);
    engine.updateCameraMatrix(this.type, matrix);
  }
}
