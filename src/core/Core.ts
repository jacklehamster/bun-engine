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

export class Core extends AuxiliaryHolder {
  readonly motor: IMotor;
  readonly engine: IGraphicsEngine;
  readonly keyboard: IKeyboard;
  readonly camera: ICamera;

  constructor(props: Props) {
    super();
    const { motor, canvas, engine, keyboard, size, camera } = props;
    this.motor = motor ?? new Motor();
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size![0], size![1]));
    this.keyboard = keyboard ?? new Keyboard({
      timeProvider: this.motor,
    });
    this.camera = camera ?? new Camera({
      motor: this.motor,
      engine: this.engine,
    });
  }

  private initialize(world: IWorld) {
    const { motor, engine } = this;
    const deregisterLoop = motor.loop(this);

    //  Initialize engine buffer
    engine.setMaxSpriteCount(world.sprites.length);

    this.addAuxiliary(motor,
      world,
      engine,
      new ResizeAux({ engine: this.engine, camera: this.camera }),
      this.keyboard,
      this.camera);

    const clearActivate = this.activate();

    return () => {
      deregisterLoop();
      clearActivate();
      this.deactivate();
      this.removeAllAuxiliaries();
    };
  }

  start(world: IWorld) {
    const deregister = this.initialize(world);

    //  Start motor loop
    return () => {
      deregister();
    };
  }
}
