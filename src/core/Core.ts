import IWorld from "world/IWorld";
import { GraphicsEngine } from "./GraphicsEngine";
import { Motor, Priority } from "./Motor";
import { CameraUpdate } from "updates/CameraUpdate";
import { Camera, CameraListener, CameraMatrixType } from "gl/camera/Camera";
import { MediaId } from "gl/texture/ImageManager";
import { TextureUpdate } from "updates/TextureUpdate";
import { SpriteId } from "world/sprite/Sprite";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";
import { Disposable } from "lifecycle/Disposable";
import { Keyboard } from "controls/Keyboard";
import { ActivateProps, Active, IdType, UpdateType } from "./Active";

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

    //  Register updates
    const textureImageUpdate = new TextureUpdate(motor, world.medias.at.bind(world.medias), engine);
    const spriteTransformUpdate = new SpriteTransformUpdate(world.sprites.at.bind(world.sprites), engine);
    const spriteAnimUpdate = new SpriteAnimUpdate(motor, world.sprites.at.bind(world.sprites), engine);
    const cameraMatrixUpdate = new CameraUpdate(this.camera.getCameraMatrix.bind(this.camera), engine);
    const onUpdates: Record<UpdateType, (id: IdType) => void> = {
      ["SpriteAnim"]: (id: SpriteId) => motor.registerUpdate(spriteAnimUpdate.withSpriteId(id)),
      ["SpriteTransform"]: (id: SpriteId) => motor.registerUpdate(spriteTransformUpdate.withSpriteId(id)),
      ["Media"]: (id: MediaId) => motor.registerUpdate(textureImageUpdate.withImageId(id)),
      ["CameraMatrix"]: (type: CameraMatrixType) => motor.registerUpdate(cameraMatrixUpdate.withCameraType(type)),
    };

    const onDeactivates = new Set<() => void>();
    onDeactivates.add(this.handleResize(onUpdates));
    onDeactivates.add(this.handleCamera(onUpdates));

    const activateProps: ActivateProps = {
      updateCallback(type, id) { onUpdates[type](id); },
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

  private handleCamera(onUpdates: Record<UpdateType, (id: IdType) => void>) {
    const listener: CameraListener = {
      onCameraUpdate() {
        onUpdates.CameraMatrix(CameraMatrixType.POS);
      }
    };

    this.camera.addUpdateListener(listener);

    onUpdates.CameraMatrix(CameraMatrixType.PROJECTION);
    onUpdates.CameraMatrix(CameraMatrixType.POS);

    return () => {
      this.camera.removeUpdateListener(listener);
    };
  }

  private handleResize(onUpdates: Record<UpdateType, (id: IdType) => void>) {
    const { engine } = this;
    //  Register resize event
    const onResize = (width: number, height: number) => {
      this.camera.configProjectionMatrix(width, height);
      onUpdates.CameraMatrix(CameraMatrixType.PROJECTION);
    };
    engine.addResizeListener(onResize);
    return () => {
      engine.removeResizeListener(onResize);
    };
  }
}
