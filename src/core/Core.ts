import IWorld from "world/IWorld";
import { GraphicsEngine } from "./GraphicsEngine";
import { Motor } from "./Motor";

export interface Props {
  motor?: Motor;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  engine?: GraphicsEngine;
  size?: [number, number],
}

export class Core {
  motor: Motor;
  engine: GraphicsEngine;

  constructor({ motor, canvas, engine, size }: Props) {
    this.motor = motor ?? new Motor();
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size![0], size![1]));
  }

  start(world: IWorld) {
    this.motor.loop(world);
    this.motor.loop(this.engine);
    this.engine.setWorld(world);
    this.motor.start();
  }
}
