import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";

export enum CameraMatrixType {
  PROJECTION = 'PROJECTION',
  VIEW = 'VIEW',
}

export class Camera {
  private camPositionMatrix: Matrix = Matrix.create().translate(0, 0, -1);
  private projectionMatrix = new ProjectionMatrix();
  private needsRefresh = false;

  configProjectionMatrix(ratio: number) {
    this.projectionMatrix.configure(ratio);
    this.updatePerspective(1);
  }

  readonly camTiltMatrix = Matrix.create();
  readonly camTurnMatrix = Matrix.create();
  private readonly camMatrix = Matrix.create();

  private readonly cameraMatrices: Record<CameraMatrixType, Matrix> = {
    [CameraMatrixType.PROJECTION]: this.projectionMatrix,
    [CameraMatrixType.VIEW]: this.camMatrix,
  };

  refresh() {
    if (!this.needsRefresh) {
      return false;
    }
    //  camMatrix =  camTiltMatrix * camTurnMatrix * camPositionMatrix;
    this.invertedCamTiltMatrix.invert(this.camTiltMatrix);
    this.invertedCamTurnMatrix.invert(this.camTurnMatrix);
    this.camMatrix.multiply3(this.camTiltMatrix, this.camTurnMatrix, this.camPositionMatrix);
    this.needsRefresh = false;
    return true;
  }

  updatePerspective(level: number) {
    this.projectionMatrix.setPerspective(level);
    this.needsRefresh = true;
  }

  getCameraMatrix(cameraMatrixType: CameraMatrixType): Float32Array {
    return this.cameraMatrices[cameraMatrixType].getMatrix();
  }

  moveCam(x: number, y: number, z: number) {
    this.camPositionMatrix.moveMatrix(x, y, z, this.camTurnMatrix);
    this.needsRefresh = true;
  }

  turnCam(angle: number) {
    this.camTurnMatrix.rotateY(angle);
    this.needsRefresh = true;
  }

  tilt(angle: number) {
    this.camTiltMatrix.rotateX(angle);
    this.needsRefresh = true;
  }

  private invertedCamTurnMatrix: Matrix = Matrix.create();
  private invertedCamTiltMatrix: Matrix = Matrix.create();
  syncHud(matrix?: Matrix) {
    matrix?.identity()
      .translateToMatrix(this.camPositionMatrix)
      .multiply(this.invertedCamTurnMatrix)
      .multiply(this.invertedCamTiltMatrix)
      .translate(0, 0, -.9);
  }
}
