import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";

export enum CameraMatrixType {
  PROJECTION = 0,
  VIEW = 1,
}

export class Camera {
  private needsRefresh = false;

  private readonly camPositionMatrix: Matrix = Matrix.create().translate(0, 0, -1);
  private readonly projectionMatrix = new ProjectionMatrix();
  private readonly camTiltMatrix = Matrix.create();
  private readonly camTurnMatrix = Matrix.create();
  private readonly camMatrix = Matrix.create();
  private readonly hudMatrix: Matrix = Matrix.create();
  private pespectiveLevel = 1;

  private readonly cameraMatrices: Record<CameraMatrixType, Matrix> = {
    [CameraMatrixType.PROJECTION]: this.projectionMatrix,
    [CameraMatrixType.VIEW]: this.camMatrix,
  };

  configProjectionMatrix(width: number, height: number) {
    this.projectionMatrix.configure(width, height);
    this.updatePerspective();
  }

  refresh() {
    if (!this.needsRefresh) {
      return false;
    }
    //  camMatrix =  camTiltMatrix * camTurnMatrix * camPositionMatrix;
    this.camMatrix.multiply3(this.camTiltMatrix, this.camTurnMatrix, this.camPositionMatrix);
    this.syncHud(this.hudMatrix);
    this.needsRefresh = false;
    return true;
  }

  updatePerspective(level?: number) {
    this.projectionMatrix.setPerspective(level ?? this.pespectiveLevel);
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

  getHudMatrix() {
    return this.hudMatrix;
  }

  private static _position: [number, number, number] = [0, 0, 0];
  getPosition() {
    const matrix = this.camPositionMatrix.getMatrix();
    Camera._position[0] = matrix[12]; // Value in the 4th column, 1st row (indices start from 0)
    Camera._position[1] = matrix[13]; // Value in the 4th column, 2nd row
    Camera._position[2] = matrix[14]; // Value in the 4th column, 3rd row
    return Camera._position;
  }

  setPosition(x: number, y: number, z: number) {
    const matrix = this.camPositionMatrix.getMatrix();
    matrix[12] = x;
    matrix[13] = y;
    matrix[14] = z;
  }

  private invertedCamTurnMatrix: Matrix = Matrix.create();
  private invertedCamTiltMatrix: Matrix = Matrix.create();
  private syncHud(matrix?: Matrix) {
    this.invertedCamTiltMatrix.invert(this.camTiltMatrix);
    this.invertedCamTurnMatrix.invert(this.camTurnMatrix);
    matrix?.identity()
      .translateToMatrix(this.camPositionMatrix)
      .multiply(this.invertedCamTurnMatrix)
      .multiply(this.invertedCamTiltMatrix)
      .translate(0, 0, -.9);
  }
}
