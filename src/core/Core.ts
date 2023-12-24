import IWorld from "world/IWorld";
import { GraphicsEngine } from "./GraphicsEngine";
import { Motor, Priority } from "./Motor";
import { Camera, CameraListener, CameraMatrixType } from "gl/camera/Camera";
import { Disposable } from "lifecycle/Disposable";
import { Keyboard } from "controls/Keyboard";
import { ActivateProps, Active } from "./Active";
import { UpdateManager } from "../updates/UpdateManager";

export interface Props {
  motor?: Motor;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  engine?: GraphicsEngine;
  keyboard?: Keyboard;
  size?: [number, number];
  camera?: Camera;
}

export class Core extends Disposable {
  motor: Motor;
  engine: GraphicsEngine;
  keyboard: Keyboard;
  camera: Camera;

  constructor({ motor, canvas, engine, keyboard, size, camera }: Props) {
    super();
    this.motor = motor ?? new Motor();
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size![0], size![1]));
    this.keyboard = keyboard ?? new Keyboard();
    this.camera = camera ?? new Camera(this);

    this.initialize();
  }

  private initialize() {
    const { engine, motor } = this;
    const deregisterGraphics = motor.loop(engine, undefined, Priority.LAST);
    this.addOnDestroy(() => {
      deregisterGraphics();
    });
  }

  start(world: IWorld) {
    const { engine, motor } = this;

    //  Initialize engine buffer
    engine.initializeBuffers(world.sprites.length);
    engine.clearTextureSlots();

    //  Activate world
    const onDeactivate = this.activate(world, [
      world, this.keyboard,
    ]);

    //  Start motor loop
    const onStop = motor.start();
    return () => {
      onStop();
      onDeactivate();
    };
  }

  activate(world: IWorld, actives: Active[]) {
    const { engine, motor } = this;

    const updateManager = new UpdateManager(motor, this.camera, engine, world);

    const onDeactivates = new Set<() => void>();
    onDeactivates.add(this.handleResize(updateManager));
    onDeactivates.add(this.handleCamera(updateManager));

    const activateProps: ActivateProps = {
      updateCallback(type, id) { updateManager.informUpdate(type, id); },
      core: this,
    };
    actives.forEach(active => {
      const onDeactivate = active.activate(activateProps);
      onDeactivates.add(onDeactivate);
    });
    return () => {
      onDeactivates.forEach(deactivate => deactivate());
    };
  }

  private handleCamera(updateManager: UpdateManager) {
    const listener: CameraListener = {
      onCameraUpdate() {
        updateManager.informUpdate("CameraMatrix", CameraMatrixType.POS);
      }
    };

    this.camera.addUpdateListener(listener);

    updateManager.informUpdate("CameraMatrix", CameraMatrixType.PROJECTION);
    updateManager.informUpdate("CameraMatrix", CameraMatrixType.POS);

    return () => {
      this.camera.removeUpdateListener(listener);
    };
  }

  private handleResize(updateManager: UpdateManager) {
    const { engine } = this;
    //  Register resize event
    const onResize = (width: number, height: number) => {
      this.camera.configProjectionMatrix(width, height);
      updateManager.informUpdate("CameraMatrix", CameraMatrixType.PROJECTION);
    };
    engine.addResizeListener(onResize);
    return () => {
      engine.removeResizeListener(onResize);
    };
  }
}
