import { Core } from "core/Core";
import { IMatrix } from "gl/transform/IMatrix";
import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { CameraUpdate } from "updates/CameraUpdate";
import { CellPos } from "world/grid/CellPos";

export enum CameraMatrixType {
  PROJECTION = 0,
  POS = 1,
  // TURN = 2,
  // TILT = 3,
}

export class Camera {
  private readonly positionMatrix: Matrix = Matrix.create().translate(0, 0, 0);
  private readonly projectionMatrix = new ProjectionMatrix();
  readonly tiltMatrix = new TiltMatrix(this.onCameraUpdate.bind(this));
  readonly turnMatrix = new TurnMatrix(this.onCameraUpdate.bind(this));
  private readonly camMatrix = Matrix.create();
  private pespectiveLevel = 1;
  private readonly cameraUpdate;

  constructor(core: Core) {
    this.cameraUpdate = new CameraUpdate(this.getCameraMatrix.bind(this), core.engine, core.motor);
  }

  initialize() {
    this.updatePerspective();
    this.cameraUpdate.informUpdate(CameraMatrixType.POS);
  }

  private readonly cameraMatrices: Record<CameraMatrixType, IMatrix> = {
    [CameraMatrixType.PROJECTION]: this.projectionMatrix,
    [CameraMatrixType.POS]: this.camMatrix,
    // [CameraMatrixType.TURN]: this.camTurnMatrix,
    // [CameraMatrixType.TILT]: this.camTiltMatrix,
  };

  configProjectionMatrix(width: number, height: number) {
    this.projectionMatrix.configure(width, height);
    this.cameraUpdate.informUpdate(CameraMatrixType.PROJECTION);
  }

  private static camPos: Matrix = Matrix.create();
  refresh() {
    //  camMatrix =  camTiltMatrix * camTurnMatrix * camPositionMatrix;
    Camera.camPos.invert(this.positionMatrix);
    this.camMatrix.multiply3(this.tiltMatrix, this.turnMatrix, Camera.camPos);
  }

  private onCameraUpdate() {
    this.refresh();
    this.cameraUpdate.informUpdate(CameraMatrixType.POS);
  }

  updatePerspective(level?: number) {
    this.projectionMatrix.setPerspective(level ?? this.pespectiveLevel);
    this.cameraUpdate.informUpdate(CameraMatrixType.PROJECTION);
  }

  getCameraMatrix(cameraMatrixType: CameraMatrixType): Float32Array {
    return this.cameraMatrices[cameraMatrixType].getMatrix();
  }

  gotoPos(x: number, y: number, z: number, speed: number = .1) {
    const curPos = this.getPosition();
    const dx = x - curPos[0];
    const dy = y - curPos[1];
    const dz = z - curPos[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist) {
      const sp = Math.min(dist, speed);
      this.positionMatrix.translate(
        dx / dist * sp,
        dy / dist * sp,
        dz / dist * sp,
      );
      this.onCameraUpdate();
    }
  }

  moveCam(x: number, y: number, z: number) {
    this.positionMatrix.moveMatrix(x, y, z, this.turnMatrix);
    this.onCameraUpdate();
  }

  //  Turn
  turnCam(angle: number) {
    this.turnMatrix.turn += angle;
    this.onCameraUpdate();
  }

  //  Tilt
  tilt(angle: number) {
    this.tiltMatrix.tilt += angle;
    this.onCameraUpdate();
  }

  private static _position: CellPos = [0, 0, 0];
  getPosition() {
    const matrix = this.positionMatrix.getMatrix();
    Camera._position[0] = matrix[12]; // Value in the 4th column, 1st row (indices start from 0)
    Camera._position[1] = matrix[13]; // Value in the 4th column, 2nd row
    Camera._position[2] = matrix[14]; // Value in the 4th column, 3rd row
    return Camera._position;
  }

  setPosition(x: number, y: number, z: number) {
    const matrix = this.positionMatrix.getMatrix();
    matrix[12] = x;
    matrix[13] = y;
    matrix[14] = z;
    this.onCameraUpdate();
  }
}
