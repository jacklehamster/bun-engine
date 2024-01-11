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
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";

export enum CameraMatrixType {
  PROJECTION = 0,
  POS = 1,
  TURN = 2,
  TILT = 3,
}

export enum CameraFloatType {
  CURVATURE = 0,
  DISTANCE = 1,
}

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class Camera extends AuxiliaryHolder<ICamera> implements ICamera {
  private readonly camMatrix = Matrix.create();
  private readonly projectionMatrix = new ProjectionMatrix();
  readonly posMatrix = new PositionMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.POS));
  readonly tiltMatrix = new TiltMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.TILT));
  readonly turnMatrix = new TurnMatrix(() => this.updateInformer.informUpdate(CameraMatrixType.TURN));
  private _pespectiveLevel = 1;
  private _curvature = 0;
  private _distance = 0;
  private readonly updateInformer;
  private readonly updateInformerFloat;

  constructor({ engine, motor }: Props) {
    super();
    this.updateInformer = new CameraUpdate(this.getCameraMatrix.bind(this), engine, motor);
    this.updateInformerFloat = new CameraFloatUpdate(this.getCameraFloat.bind(this), engine, motor);
    this.addAuxiliary(this.posMatrix);
  }

  activate() {
    super.activate();
    this.updateInformer.informUpdate(CameraMatrixType.PROJECTION);
    this.updateInformer.informUpdate(CameraMatrixType.POS);
    this.updateInformer.informUpdate(CameraMatrixType.TURN);
    this.updateInformer.informUpdate(CameraMatrixType.TILT);
    this.updateInformerFloat.informUpdate(CameraFloatType.CURVATURE);
    this.updateInformerFloat.informUpdate(CameraFloatType.DISTANCE);
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

  set perspective(level: number) {
    this.projectionMatrix.setPerspective(level ?? this._pespectiveLevel);
    this.updateInformer.informUpdate(CameraMatrixType.PROJECTION);
  }

  set curvature(value: number) {
    this._curvature = value;
    this.updateInformerFloat.informUpdate(CameraFloatType.CURVATURE);
  }

  set distance(value: number) {
    this._distance = value;
    this.updateInformerFloat.informUpdate(CameraFloatType.DISTANCE);
  }

  private getCameraMatrix(cameraMatrixType: CameraMatrixType): Float32Array {
    if (cameraMatrixType === CameraMatrixType.POS) {
      this.camMatrix.invert(this.posMatrix);
    }
    return this.cameraMatrices[cameraMatrixType].getMatrix();
  }

  private getCameraFloat(cameraFloatType: CameraFloatType): number {
    switch (cameraFloatType) {
      case CameraFloatType.CURVATURE:
        return this._curvature;
      case CameraFloatType.DISTANCE:
        return this._distance;
    }
  }

  moveCam(x: number, y: number, z: number) {
    this.posMatrix.moveBy(x, y, z, this.turnMatrix);
  }
}
