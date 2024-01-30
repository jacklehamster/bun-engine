import Matrix from "gl/transform/Matrix";
import { Vector } from "core/types/Vector";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { ICamera } from "./ICamera";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { MatrixUniform, VectorUniform } from "graphics/Uniforms";
import { FloatUniform } from "graphics/Uniforms";
import { NumVal } from "core/value/NumVal";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";
import { MatrixUniformHandler } from "gl/uniforms/MatrixUniformHandler";
import { BG_BLUR_LOC, BG_COLOR_LOC, CAM_CURVATURE_LOC, CAM_DISTANCE_LOC, CAM_POS_LOC, CAM_PROJECTION_LOC, CAM_TILT_LOC, CAM_TURN_LOC, FADE_LOC } from "gl/attributes/Constants";
import { FloatUniformHandler } from "gl/uniforms/FloatUniformHandler";
import { VectorUniformHandler } from "gl/uniforms/VectorUniformHandler";

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
}

export class Camera extends AuxiliaryHolder<ICamera> implements ICamera {
  readonly position: IPositionMatrix = new PositionMatrix(() => {
    this.camMatrix.invert(this.position);
    this.updateInformer.informUpdate(MatrixUniform.CAM_POS);
  });
  readonly projection = new ProjectionMatrix(() => this.updateInformer.informUpdate(MatrixUniform.PROJECTION));
  readonly tilt = new TiltMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_TILT));
  readonly turn = new TurnMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_TURN));
  readonly curvature = new NumVal(0.05, () => this.updateInformerFloat.informUpdate(FloatUniform.CURVATURE));
  readonly distance = new NumVal(.5, () => this.updateInformerFloat.informUpdate(FloatUniform.CAM_DISTANCE));
  readonly blur = new NumVal(1, () => this.updateInformerFloat.informUpdate(FloatUniform.BG_BLUR));
  readonly fade = new NumVal(0, () => this.updateInformerFloat.informUpdate(FloatUniform.FADE));

  private readonly camMatrix = Matrix.create();
  private readonly _bgColor: Vector = [0, 0, 0];
  private readonly _viewportSize: [number, number] = [0, 0];
  private readonly updateInformer;
  private readonly updateInformerFloat;
  private readonly updateInformerVector;
  private readonly engine;

  constructor({ engine, motor }: Props) {
    super();
    this.engine = engine;

    const matrixUniformUpdaters: Record<MatrixUniform, MatrixUniformHandler> = {
      [MatrixUniform.PROJECTION]: engine.createMatrixUniformHandler(CAM_PROJECTION_LOC, this.projection),
      [MatrixUniform.CAM_POS]: engine.createMatrixUniformHandler(CAM_POS_LOC, this.camMatrix),
      [MatrixUniform.CAM_TURN]: engine.createMatrixUniformHandler(CAM_TURN_LOC, this.turn),
      [MatrixUniform.CAM_TILT]: engine.createMatrixUniformHandler(CAM_TILT_LOC, this.tilt),
    };

    this.updateInformer = new UpdateRegistry<MatrixUniform>(ids => {
      ids.forEach(type => matrixUniformUpdaters[type].update());
      ids.clear();
    }, motor);

    const vectorUniformUpdaters: Record<VectorUniform, VectorUniformHandler> = {
      [VectorUniform.BG_COLOR]: engine.createVectorUniformHandler(BG_COLOR_LOC, this._bgColor),
    };
    this.updateInformerVector = new UpdateRegistry<VectorUniform>((ids) => {
      ids.forEach(type => vectorUniformUpdaters[type].update());
      ids.clear();
    }, motor);

    const valUniformUpdaters: Record<FloatUniform, FloatUniformHandler | undefined> = {
      [FloatUniform.BG_BLUR]: engine.createFloatUniformHandler(BG_BLUR_LOC, this.blur),
      [FloatUniform.CAM_DISTANCE]: engine.createFloatUniformHandler(CAM_DISTANCE_LOC, this.distance),
      [FloatUniform.CURVATURE]: engine.createFloatUniformHandler(CAM_CURVATURE_LOC, this.curvature),
      [FloatUniform.TIME]: undefined,
      [FloatUniform.FADE]: engine.createFloatUniformHandler(FADE_LOC, this.fade),
    };
    this.updateInformerFloat = new UpdateRegistry<FloatUniform>(ids => {
      ids.forEach(type => {
        valUniformUpdaters[type]?.update();
      });
      ids.clear();
    }, motor);
    this.addAuxiliary(this.position);
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

  resizeViewport(width: number, height: number) {
    if (this._viewportSize[0] !== width || this._viewportSize[1] !== height) {
      this._viewportSize[0] = width;
      this._viewportSize[1] = height;
      this.projection.configure(this._viewportSize);
    }
  }

  setBackgroundColor(rgb: number) {
    const red = (rgb >> 16) & 0xFF;
    const green = (rgb >> 8) & 0xFF;
    const blue = rgb & 0xFF;
    this._bgColor[0] = red / 255.0;
    this._bgColor[1] = green / 255.0;
    this._bgColor[2] = blue / 255.0;
    this.updateInformerVector.informUpdate(VectorUniform.BG_COLOR);
    this.engine.setBgColor(this._bgColor);
  }
}
