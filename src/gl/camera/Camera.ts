import { Core } from "core/Core";
import { IMatrix } from "gl/transform/IMatrix";
import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { Refresh } from "updates/Refresh";
import { CellPos } from "world/grid/CellPos";

export enum CameraMatrixType {
  PROJECTION = 0,
  POS = 1,
  // TURN = 2,
  // TILT = 3,
}

export interface CameraListener {
  onCameraUpdate(camera: Camera): void;
}

export class Camera implements Refresh {
  private readonly camPositionMatrix: Matrix = Matrix.create().translate(0, 0, -1);
  private readonly projectionMatrix = new ProjectionMatrix();
  private readonly camTiltMatrix = new TiltMatrix();
  private readonly camTurnMatrix = new TurnMatrix();
  private readonly camMatrix = Matrix.create();
  private pespectiveLevel = 1;
  private readonly updateListeners: Set<CameraListener> = new Set();

  constructor(private core: Core) {
  }

  private readonly cameraMatrices: Record<CameraMatrixType, IMatrix> = {
    [CameraMatrixType.PROJECTION]: this.projectionMatrix,
    [CameraMatrixType.POS]: this.camMatrix,
    // [CameraMatrixType.TURN]: this.camTurnMatrix,
    // [CameraMatrixType.TILT]: this.camTiltMatrix,
  };

  addUpdateListener(listener: CameraListener) {
    this.updateListeners.add(listener);
    return () => {
      this.removeUpdateListener(listener);
    };
  }

  removeUpdateListener(listener: CameraListener) {
    this.updateListeners.delete(listener);
  }

  configProjectionMatrix(width: number, height: number) {
    this.projectionMatrix.configure(width, height);
    this.updatePerspective();
  }

  private static camPos: Matrix = Matrix.create();
  refresh() {
    //  camMatrix =  camTiltMatrix * camTurnMatrix * camPositionMatrix;
    Camera.camPos.invert(this.camPositionMatrix);
    this.camMatrix.multiply3(this.camTiltMatrix, this.camTurnMatrix, Camera.camPos);
    this.updateListeners.forEach(listener => listener.onCameraUpdate(this));
  }

  private onCameraUpdate() {
    this.core.motor.registerUpdate(this);
  }

  updatePerspective(level?: number) {
    this.projectionMatrix.setPerspective(level ?? this.pespectiveLevel);
    this.onCameraUpdate();
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
      this.camPositionMatrix.translate(
        dx / dist * sp,
        dy / dist * sp,
        dz / dist * sp,
      );
      this.onCameraUpdate();
    }
  }

  moveCam(x: number, y: number, z: number) {
    this.camPositionMatrix.moveMatrix(x, y, z, this.camTurnMatrix);
    this.onCameraUpdate();
  }

  turnCam(angle: number) {
    this.camTurnMatrix.turn += angle;
    this.onCameraUpdate();
  }

  getTurnAngle() {
    return this.camTurnMatrix.turn;
  }

  tilt(angle: number) {
    this.camTiltMatrix.tilt += angle;
    this.onCameraUpdate();
  }

  private static _position: CellPos = [0, 0, 0];
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
    this.onCameraUpdate();
  }
}
