import Matrix from "gl/transform/Matrix";
import { IMatrix, Vector } from "gl/transform/IMatrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { CameraUpdate } from "updates/CameraUpdate";
import { ICamera } from "./ICamera";
import { CameraFloatUpdate } from "updates/CameraFloatUpdate";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { MatrixUniform, VectorUniform } from "graphics/Uniforms";
import { FloatUniform } from "graphics/Uniforms";
import { CameraVectorUpdate } from "updates/CameraVectorUpdate";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class Camera extends AuxiliaryHolder<ICamera> implements ICamera {
  private readonly camMatrix = Matrix.create();
  readonly projectionMatrix = new ProjectionMatrix(() => this.updateInformer.informUpdate(MatrixUniform.PROJECTION));
  readonly posMatrix = new PositionMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_POS));
  readonly tiltMatrix = new TiltMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_TILT));
  readonly turnMatrix = new TurnMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_TURN));
  private _curvature = 0.05;
  private _distance = .5;
  private _bgColor: Vector = [0, 0, 0];
  private _blur = 1;
  private _viewportWidth = 0;
  private _viewportHeight = 0;
  private readonly updateInformer;
  private readonly updateInformerFloat;
  private readonly updateInformerVector;
  private readonly engine;

  constructor({ engine, motor }: Props) {
    super();
    this.engine = engine;
    this.updateInformer = new CameraUpdate(this.getCameraMatrix.bind(this), engine, motor);
    this.updateInformerFloat = new CameraFloatUpdate(this.getCameraFloat.bind(this), engine, motor);
    this.updateInformerVector = new CameraVectorUpdate(this.getCameraVector.bind(this), engine, motor);
    this.addAuxiliary(this.posMatrix);
  }

  activate() {
    super.activate();
    this.updateInformer.informUpdate(MatrixUniform.PROJECTION);
    this.updateInformer.informUpdate(MatrixUniform.CAM_POS);
    this.updateInformer.informUpdate(MatrixUniform.CAM_TURN);
    this.updateInformer.informUpdate(MatrixUniform.CAM_TILT);
    this.updateInformerFloat.informUpdate(FloatUniform.CURVATURE);
    this.updateInformerFloat.informUpdate(FloatUniform.CAM_DISTANCE);
    this.updateInformerFloat.informUpdate(FloatUniform.BG_BLUR);
    this.updateInformerVector.informUpdate(VectorUniform.BG_COLOR);
  }

  private readonly cameraMatrices: Record<MatrixUniform, IMatrix> = {
    [MatrixUniform.PROJECTION]: this.projectionMatrix,
    [MatrixUniform.CAM_POS]: this.camMatrix,
    [MatrixUniform.CAM_TURN]: this.turnMatrix,
    [MatrixUniform.CAM_TILT]: this.tiltMatrix,
  };

  private readonly cameraVectors: Record<VectorUniform, Vector> = {
    [VectorUniform.BG_COLOR]: this._bgColor,
  }

  resizeViewport(width: number, height: number) {
    if (this._viewportWidth !== width || this._viewportHeight !== height) {
      this._viewportWidth = width;
      this._viewportHeight = height;
      this.projectionMatrix.configure(this._viewportWidth, this._viewportHeight);
    }
  }

  set curvature(value: number) {
    this._curvature = value;
    this.updateInformerFloat.informUpdate(FloatUniform.CURVATURE);
  }

  set distance(value: number) {
    this._distance = value;
    this.updateInformerFloat.informUpdate(FloatUniform.CAM_DISTANCE);
  }

  set blur(value: number) {
    this._blur = value;
    this.updateInformerFloat.informUpdate(FloatUniform.BG_BLUR);
  }

  set bgColor(rgb: number) {
    const red = (rgb >> 16) & 0xFF;
    const green = (rgb >> 8) & 0xFF;
    const blue = rgb & 0xFF;
    this._bgColor[0] = red / 255.0;
    this._bgColor[1] = green / 255.0;
    this._bgColor[2] = blue / 255.0;
    this.updateInformerVector.informUpdate(VectorUniform.BG_COLOR);
    this.engine.setBgColor(this._bgColor);
  }

  private getCameraMatrix(uniform: MatrixUniform): Float32Array {
    if (uniform === MatrixUniform.CAM_POS) {
      this.camMatrix.invert(this.posMatrix);
    }
    return this.cameraMatrices[uniform].getMatrix();
  }

  private getCameraFloat(uniform: FloatUniform): number {
    switch (uniform) {
      case FloatUniform.CURVATURE:
        return this._curvature;
      case FloatUniform.CAM_DISTANCE:
        return this._distance;
      case FloatUniform.BG_BLUR:
        return this._blur;
    }
  }

  private getCameraVector(uniform: VectorUniform): Vector {
    return this.cameraVectors[uniform];
  }

  moveCam(x: number, y: number, z: number) {
    this.posMatrix.moveBy(x, y, z, this.turnMatrix);
  }
}
