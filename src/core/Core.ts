import IWorld, { IdType, UpdateType } from "world/IWorld";
import { GraphicsEngine } from "./GraphicsEngine";
import { Motor, Priority } from "./Motor";
import { CameraUpdate } from "updates/CameraUpdate";
import { Camera, CameraMatrixType } from "gl/camera/Camera";
import { ImageId } from "gl/texture/ImageManager";
import { TextureUpdate } from "updates/TextureUpdate";
import { SpriteId } from "world/Sprite";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";
import { Disposable } from "lifecycle/Disposable";

export interface Props {
  motor?: Motor;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  engine?: GraphicsEngine;
  size?: [number, number];
  camera?: Camera;
}

export class Core extends Disposable {
  motor: Motor;
  engine: GraphicsEngine;
  camera: Camera;

  private cameraMatrixUpdates: Record<CameraMatrixType, CameraUpdate>;
  private onDeactivateWorld() { }

  constructor({ motor, canvas, engine, size, camera }: Props) {
    super();
    this.motor = motor ?? new Motor();
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size![0], size![1]));
    this.camera = camera ?? new Camera();
    this.cameraMatrixUpdates = {
      [CameraMatrixType.VIEW]: new CameraUpdate(CameraMatrixType.VIEW, this.camera, this.engine),
      [CameraMatrixType.PROJECTION]: new CameraUpdate(CameraMatrixType.PROJECTION, this.camera, this.engine),
    };

    this.onResize = this.onResize.bind(this);
    this.initialize();
  }

  private initialize() {
    const { engine, motor } = this;
    motor.loop(engine, undefined, Priority.LAST);
    engine.addResizeListener(this.onResize);
  }

  private onResize(width: number, height: number) {
    this.camera.configProjectionMatrix(width, height);
    this.motor.registerUpdate(this.cameraMatrixUpdates[CameraMatrixType.PROJECTION]);
  }

  start(world: IWorld): void {
    const { engine, motor } = this;

    const textureImageUpdate = new TextureUpdate(motor, world.getMedia, engine);
    const spriteTransformUpdate = new SpriteTransformUpdate(world.getSprite, engine);
    const spriteAnimUpdate = new SpriteAnimUpdate(motor, world.getSprite, engine);

    const onUpdates: Record<UpdateType, (id: IdType) => void> = {
      ["SpriteAnim"]: (id: SpriteId) => motor.registerUpdate(spriteAnimUpdate.withSpriteId(id)),
      ["SpriteTransform"]: (id: SpriteId) => motor.registerUpdate(spriteTransformUpdate.withSpriteId(id)),
      ["Media"]: (id: ImageId) => motor.registerUpdate(textureImageUpdate.withImageId(id)),
      ["Camera"]: (id: CameraMatrixType) => motor.registerUpdate(this.cameraMatrixUpdates[id]),
    };

    world.setOnUpdate((type, id) => onUpdates[type](id));

    motor.loop(world);

    engine.initializeBuffers(world.getMaxSpriteCount());
    engine.clearTextureSlots();

    this.onDeactivateWorld = world?.activate();
    motor.start();
  }

  destroy() {
    super.destroy();
    this.engine.removeResizeListener(this.onResize);
    this.onDeactivateWorld();
  }
}
