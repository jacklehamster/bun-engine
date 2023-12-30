import { Core } from "core/Core";
import { IMatrix } from "gl/transform/IMatrix";
import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { CameraUpdate } from "updates/CameraUpdate";
import { CellPos } from "world/grid/CellPos";
import { ICamera } from "./ICamera";
import { CameraFloatUpdate } from "updates/CameraFloatUpdate";

export enum CameraMatrixType {
  PROJECTION = 0,
  POS = 1,
  TURN = 2,
  TILT = 3,
}

export enum CameraFloatType {
  CURVATURE = 0,
}

export class Camera implements ICamera {
  private readonly positionMatrix: Matrix = Matrix.create().translate(0, 0, 0);
  private readonly camMatrix = Matrix.create();
  private readonly projectionMatrix = new ProjectionMatrix();
  readonly tiltMatrix = new TiltMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.TILT));
  readonly turnMatrix = new TurnMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.TURN));
  private pespectiveLevel = 1;
  private curvature = 0;
  private readonly updateInformer;
  private readonly updateInformerFloat;

  constructor(core: Core) {
    this.updateInformer = new CameraUpdate(this.getCameraMatrix.bind(this), core.engine, core.motor);
    this.updateInformerFloat = new CameraFloatUpdate(this.getCameraFloat.bind(this), core.engine, core.motor);
  }

  activate() {
    this.updatePerspective();
    this.updateInformer.informUpdate(CameraMatrixType.POS);
    this.updateInformer.informUpdate(CameraMatrixType.TURN);
    this.updateInformer.informUpdate(CameraMatrixType.TILT);
  }

  private readonly cameraMatrices: Record<CameraMatrixType, IMatrix> = {
    [CameraMatrixType.PROJECTION]: this.projectionMatrix,
    [CameraMatrixType.POS]: this.camMatrix,
    [CameraMatrixType.TURN]: this.turnMatrix,
    [CameraMatrixType.TILT]: this.tiltMatrix,
  };

  configProjectionMatrix(width: number, height: number) {
    this.projectionMatrix.configure(width, height);
    this.updateInformer.informUpdate(CameraMatrixType.PROJECTION);
  }

  updatePerspective(level?: number) {
    this.projectionMatrix.setPerspective(level ?? this.pespectiveLevel);
    this.updateInformer.informUpdate(CameraMatrixType.PROJECTION);
  }

  updateCurvature(value: number) {
    this.curvature = value;
    this.updateInformerFloat.informUpdate(CameraFloatType.CURVATURE);
  }

  getCameraMatrix(cameraMatrixType: CameraMatrixType): Float32Array {
    if (cameraMatrixType === CameraMatrixType.POS) {
      this.camMatrix.invert(this.positionMatrix);
    }
    return this.cameraMatrices[cameraMatrixType].getMatrix();
  }

  getCameraFloat(cameraFloatType: CameraFloatType): number {
    switch (cameraFloatType) {
      case CameraFloatType.CURVATURE:
        return this.curvature;
    }
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
      this.updateInformer.informUpdate(CameraMatrixType.POS);
    }
  }

  moveCam(x: number, y: number, z: number) {
    this.positionMatrix.moveMatrix(x, y, z, this.turnMatrix);
    this.updateInformer.informUpdate(CameraMatrixType.POS);
  }

  //  Turn
  turn(angle: number) {
    this.turnMatrix.turn += angle;
  }

  //  Tilt
  tilt(angle: number) {
    this.tiltMatrix.tilt += angle;
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
    this.updateInformer.informUpdate(CameraMatrixType.POS);
  }
}
