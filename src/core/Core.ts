import IWorld from "world/IWorld";
import { GraphicsEngine } from "./graphics/GraphicsEngine";
import { Motor } from "./motor/Motor";
import { Camera } from "gl/camera/Camera";
import { Keyboard } from "controls/Keyboard";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { IKeyboard } from "controls/IKeyboard";
import { ResizeAux } from "./aux/ResizeAux";
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
  readonly keyboard: IKeyboard;
  readonly camera: ICamera;

  constructor({ motor, canvas, engine, keyboard, size, camera }: Props) {
    super();
    this.motor = motor ?? new Motor();
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size![0], size![1]));
    this.keyboard = keyboard ?? new Keyboard(this.motor);
    this.camera = camera ?? new Camera(this);
  }

  start(world: IWorld) {
    const { motor, engine, keyboard, camera } = this;
    const deregisterLoop = motor.loop(this);

    this.addAuxiliary(
      world,
      motor,
      keyboard,
      camera,
      engine,
    );
    camera.addAuxiliary(new ResizeAux({ engine }));
    this.activate();

    return () => {
      deregisterLoop();
      this.deactivate();
    };
  }
}
