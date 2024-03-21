import { createTiltMatrix, createTurnMatrix, ProjectionMatrix, Matrix, IMatrix, InvertMatrix } from "dok-matrix";
import { ICamera } from "./ICamera";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor-loop";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { NumVal } from "progressive-value";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { PositionMatrix, IPositionMatrix } from "dok-matrix";
import { MatrixUniformHandler } from "gl/uniforms/update/MatrixUniformHandler";
import { BG_BLUR_LOC, BG_COLOR_LOC, CAM_CURVATURE_LOC, CAM_DISTANCE_LOC, CAM_POS_LOC, CAM_PROJECTION_LOC, CAM_TILT_LOC, CAM_TURN_LOC, FADE_LOC } from "gl/attributes/Constants";
import { FloatUniformHandler } from "gl/uniforms/update/FloatUniformHandler";
import { VectorUniformHandler } from "gl/uniforms/update/VectorUniformHandler";
import { Vector } from "dok-types";
import { IChangeListener } from "change-listener";

interface Config {
  distance?: number;
  tilt?: number;
  zoom?: number;
  perspective?: number;
  backgroundColor?: number;
}

interface Props {
  engine: IGraphicsEngine;
  motor: IMotor;
  position?: IPositionMatrix;
  projection?: ProjectionMatrix;
  config?: Config;
}

export class Camera extends AuxiliaryHolder implements ICamera {
  readonly position;
  readonly projection;
  readonly tilt = createTiltMatrix(() => this.#updateInformer.informUpdate(MatrixUniform.CAM_TILT));
  readonly turn = createTurnMatrix(() => this.#updateInformer.informUpdate(MatrixUniform.CAM_TURN));
  readonly curvature = new NumVal(0.05, () => this.#updateInformerFloat.informUpdate(FloatUniform.CURVATURE));
  readonly distance = new NumVal(.5, () => this.#updateInformerFloat.informUpdate(FloatUniform.CAM_DISTANCE));
  readonly blur = new NumVal(1, () => this.#updateInformerFloat.informUpdate(FloatUniform.BG_BLUR));
  readonly fade = new NumVal(0, () => this.#updateInformerFloat.informUpdate(FloatUniform.FADE));

  readonly #camMatrix;
  readonly #bgColor: Vector = [0, 0, 0];
  readonly #viewportSize: [number, number] = [0, 0];
  readonly #updateInformer;
  readonly #updateInformerFloat;
  readonly #updateInformerVector;
  readonly #engine;
  readonly #positionChangeListener: IChangeListener<IMatrix> = {
    onChange: () => this.#updateInformer.informUpdate(MatrixUniform.CAM_POS)
  };
  readonly #projectionChangeListener: IChangeListener<IMatrix> = {
    onChange: () => this.#updateInformer.informUpdate(MatrixUniform.PROJECTION)
  };

  constructor({ engine, motor, position = new PositionMatrix, projection = new ProjectionMatrix(), config = {} }: Props) {
    super();
    this.#engine = engine;
    this.position = position;
    this.projection = projection;
    this.#camMatrix = new InvertMatrix(this.position);

    const matrixUniformUpdaters: Record<MatrixUniform, MatrixUniformHandler> = {
      [MatrixUniform.PROJECTION]: engine.createMatrixUniformHandler(CAM_PROJECTION_LOC, this.projection),
      [MatrixUniform.CAM_POS]: engine.createMatrixUniformHandler(CAM_POS_LOC, this.#camMatrix),
      [MatrixUniform.CAM_TURN]: engine.createMatrixUniformHandler(CAM_TURN_LOC, this.turn),
      [MatrixUniform.CAM_TILT]: engine.createMatrixUniformHandler(CAM_TILT_LOC, this.tilt),
    };

    this.#updateInformer = new UpdateRegistry<MatrixUniform>(ids => {
      ids.forEach(type => matrixUniformUpdaters[type].update());
      ids.clear();
    }, motor);

    const vectorUniformUpdaters: Record<VectorUniform, VectorUniformHandler> = {
      [VectorUniform.BG_COLOR]: engine.createVectorUniformHandler(BG_COLOR_LOC, this.#bgColor),
    };
    this.#updateInformerVector = new UpdateRegistry<VectorUniform>((ids) => {
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
    this.#updateInformerFloat = new UpdateRegistry<FloatUniform>(ids => {
      ids.forEach(type => {
        valUniformUpdaters[type]?.update();
      });
      ids.clear();
    }, motor);


    if (config.distance) {
      this.distance.setValue(config.distance);
    }
    if (config.tilt) {
      this.tilt.angle.setValue(config.tilt);
    }
    if (config.zoom) {
      this.projection.zoom.setValue(config.zoom);
    }
    if (config.perspective) {
      this.projection.perspective.setValue(config.perspective);
    }
    if (config.backgroundColor) {
      this.setBackgroundColor(config.backgroundColor);
    }
  }

  activate() {
    super.activate();
    this.#updateInformer.informUpdate(MatrixUniform.PROJECTION);
    this.#updateInformer.informUpdate(MatrixUniform.CAM_POS);
    this.#updateInformer.informUpdate(MatrixUniform.CAM_TURN);
    this.#updateInformer.informUpdate(MatrixUniform.CAM_TILT);
    this.#updateInformerFloat.informUpdate(FloatUniform.CURVATURE);
    this.#updateInformerFloat.informUpdate(FloatUniform.CAM_DISTANCE);
    this.#updateInformerFloat.informUpdate(FloatUniform.BG_BLUR);
    this.#updateInformerVector.informUpdate(VectorUniform.BG_COLOR);
    this.position.addChangeListener(this.#positionChangeListener);
    this.projection.addChangeListener(this.#projectionChangeListener);
    this.#camMatrix.activate();
  }

  deactivate(): void {
    this.#camMatrix.deactivate();
    this.projection.removeChangeListener(this.#projectionChangeListener);
    this.position.removeChangeListener(this.#positionChangeListener);
    super.deactivate();
  }

  resizeViewport(width: number, height: number) {
    if (this.#viewportSize[0] !== width || this.#viewportSize[1] !== height) {
      this.#viewportSize[0] = width;
      this.#viewportSize[1] = height;
      this.projection.configure(this.#viewportSize);
    }
  }

  setBackgroundColor(rgb: number) {
    const red = (rgb >> 16) & 0xFF;
    const green = (rgb >> 8) & 0xFF;
    const blue = rgb & 0xFF;
    this.#bgColor[0] = red / 255.0;
    this.#bgColor[1] = green / 255.0;
    this.#bgColor[2] = blue / 255.0;
    this.#updateInformerVector.informUpdate(VectorUniform.BG_COLOR);
    this.#engine.setBgColor(this.#bgColor);
  }
}

enum MatrixUniform {
  PROJECTION = 0,
  CAM_POS = 1,
  CAM_TURN = 2,
  CAM_TILT = 3
}

enum VectorUniform {
  BG_COLOR = 0
}

enum FloatUniform {
  TIME = 0,
  CURVATURE = 1,
  CAM_DISTANCE = 2,
  BG_BLUR = 3,
  FADE = 4
}
