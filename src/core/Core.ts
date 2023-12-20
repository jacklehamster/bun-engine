import IWorld, { IdType, UpdateType } from "world/IWorld";
import { GraphicsEngine } from "./GraphicsEngine";
import { Motor, Priority } from "./Motor";
import { CameraUpdate } from "updates/CameraUpdate";
import { CameraMatrixType } from "gl/camera/Camera";
import { ImageId } from "gl/texture/ImageManager";
import { TextureUpdate } from "updates/TextureUpdate";
import { SpriteId } from "world/sprite/Sprite";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";
import { Disposable } from "lifecycle/Disposable";

export interface Props {
  motor?: Motor;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  engine?: GraphicsEngine;
  size?: [number, number];
}

export class Core extends Disposable {
  motor: Motor;
  engine: GraphicsEngine;

  constructor({ motor, canvas, engine, size }: Props) {
    super();
    this.motor = motor ?? new Motor();
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size![0], size![1]));

    this.initialize();
  }

  private initialize() {
    const { engine, motor } = this;
    motor.loop(engine, undefined, Priority.LAST);
  }

  start(world: IWorld): void {
    const { engine, motor } = this;

    //  Register updates
    const textureImageUpdate = new TextureUpdate(motor, world.medias.at.bind(world.medias), engine);
    const spriteTransformUpdate = new SpriteTransformUpdate(world.sprites.at.bind(world.sprites), engine);
    const spriteAnimUpdate = new SpriteAnimUpdate(motor, world.sprites.at.bind(world.sprites), engine);
    const cameraMatrixUpdate = new CameraUpdate(world.camera.getCameraMatrix.bind(world.camera), engine);

    const onUpdates: Record<UpdateType, (id: IdType) => void> = {
      ["SpriteAnim"]: (id: SpriteId) => motor.registerUpdate(spriteAnimUpdate.withSpriteId(id)),
      ["SpriteTransform"]: (id: SpriteId) => motor.registerUpdate(spriteTransformUpdate.withSpriteId(id)),
      ["Media"]: (id: ImageId) => motor.registerUpdate(textureImageUpdate.withImageId(id)),
      ["Camera"]: (type: CameraMatrixType) => motor.registerUpdate(cameraMatrixUpdate.withCameraType(type)),
    };

    //  Register resize event
    const onResize = (width: number, height: number) => {
      world.camera.configProjectionMatrix(width, height);
      this.motor.registerUpdate(cameraMatrixUpdate.withCameraType(CameraMatrixType.PROJECTION));
    };
    engine.addResizeListener(onResize);
    this.addOnDestroy(() => engine.removeResizeListener(onResize));

    //  Initialize engine buffer
    engine.initializeBuffers(world.sprites.length);
    engine.clearTextureSlots();

    //  Activate world
    const onDeactivateWorld = world?.activate({
      updateCallback(type, id) { onUpdates[type](id); }
    });
    this.addOnDestroy(onDeactivateWorld);

    //  Start motor loop
    motor.loop(world);
    motor.start();
  }
}
