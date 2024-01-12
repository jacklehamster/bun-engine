import IWorld from "world/IWorld";
import { GraphicsEngine } from "./graphics/GraphicsEngine";
import { Motor } from "./motor/Motor";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { IKeyboard } from "controls/IKeyboard";
import { ICamera } from "gl/camera/ICamera";
import { IGraphicsEngine } from "./graphics/IGraphicsEngine";
import { IMotor } from "./motor/IMotor";

export interface Props {
  motor?: IMotor;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  engine?: IGraphicsEngine;
  keyboard?: IKeyboard;
  size?: [number, number];
  camera?: ICamera;
}

export class Core extends AuxiliaryHolder<Core> {
  readonly motor: IMotor;
  readonly engine: IGraphicsEngine;

  constructor({ motor, canvas, engine, size }: Props) {
    super();
    this.motor = motor ?? new Motor();
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size![0], size![1]));
  }

  start(world: IWorld) {
    const { motor, engine } = this;

    this.addAuxiliary(
      world,
      motor,
      engine,
    );
    this.activate();
  }

  stop() {
    this.motor.deregisterUpdate(this);
    this.deactivate();
  }
}
