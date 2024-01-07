import { IMatrix } from "gl/transform/IMatrix";
import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { CameraUpdate } from "updates/CameraUpdate";
import { ICamera } from "./ICamera";
import { CameraFloatUpdate } from "updates/CameraFloatUpdate";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { PositionMatrix } from "gl/transform/PositionMatrix";

export enum CameraMatrixType {
  PROJECTION = 0,
  POS = 1,
  TURN = 2,
  TILT = 3,
}

export enum CameraFloatType {
  CURVATURE = 0,
}

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class Camera implements ICamera {
  private readonly camMatrix = Matrix.create();
  private readonly projectionMatrix = new ProjectionMatrix();
  readonly posMatrix = new PositionMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.POS));
  readonly tiltMatrix = new TiltMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.TILT));
  readonly turnMatrix = new TurnMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.TURN));
  private pespectiveLevel = 1;
  private curvature = 0;
  private readonly updateInformer;
  private readonly updateInformerFloat;

  constructor({ engine, motor }: Props) {
    this.updateInformer = new CameraUpdate(this.getCameraMatrix.bind(this), engine, motor);
    this.updateInformerFloat = new CameraFloatUpdate(this.getCameraFloat.bind(this), engine, motor);
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
      this.camMatrix.invert(this.posMatrix);
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
    if (dist > .01) {
      const sp = Math.min(dist, speed);
      this.posMatrix.translate(
        dx / dist * sp,
        dy / dist * sp,
        dz / dist * sp,
      );
    } else {
      this.posMatrix.setPosition(x, y, z);
    }
  }

  moveCam(x: number, y: number, z: number) {
    this.posMatrix.moveMatrix(x, y, z, this.turnMatrix);
  }

  //  Turn
  turn(angle: number) {
    this.turnMatrix.turn += angle;
  }

  //  Tilt
  tilt(angle: number) {
    this.tiltMatrix.tilt += angle;
  }

  getPosition() {
    return this.posMatrix.getPosition();
  }

  setPosition(x: number, y: number, z: number) {
    this.posMatrix.setPosition(x, y, z);
  }
}
