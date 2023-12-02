import IWorld, { IdType, UpdateType } from "world/IWorld";
import { GraphicsEngine } from "./GraphicsEngine";
import { Motor, Priority } from "./Motor";
import { CameraUpdate } from "updates/CameraUpdate";
import { CameraMatrixType } from "gl/camera/Camera";
import { ImageId } from "gl/texture/ImageManager";
import { TextureUpdate } from "updates/TextureUpdate";
import { SpriteId } from "world/Sprite";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";

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
    this.initialize();
  }

  private initialize() {
    const { engine, motor } = this;
    motor.loop(engine, undefined, Priority.LAST);
  }

  start(world: IWorld): () => void {
    const { engine, motor } = this;
    const camera = world.getCamera();
    const cameraMatrixUpdates: Record<CameraMatrixType, CameraUpdate> = {
      [CameraMatrixType.VIEW]: new CameraUpdate(CameraMatrixType.VIEW, camera, engine),
      [CameraMatrixType.PROJECTION]: new CameraUpdate(CameraMatrixType.PROJECTION, camera, engine),
    };

    const textureImageUpdate = new TextureUpdate(world.getMedia, engine);
    const spriteTransformUpdate = new SpriteTransformUpdate(world.getSprite, engine);
    const spriteAnimUpdate = new SpriteAnimUpdate(world.getSprite, engine);

    const onUpdates: Record<UpdateType, (id: IdType) => void> = {
      ["SpriteAnim"]: (id: SpriteId) => motor.registerUpdate(spriteAnimUpdate.withSpriteId(id)),
      ["SpriteTransform"]: (id: SpriteId) => motor.registerUpdate(spriteTransformUpdate.withSpriteId(id)),
      ["Media"]: (id: ImageId) => motor.registerUpdate(textureImageUpdate.withImageId(id)),
      ["Camera"]: (id: CameraMatrixType) => motor.registerUpdate(cameraMatrixUpdates[id]),
    };

    world.setOnUpdate((type, id) => onUpdates[type](id));

    motor.loop(world);

    engine.initializeBuffers(world.getMaxSpriteCount());
    engine.clearTextureSlots();

    const onDeactivateWorld = world?.activate();
    motor.start();
    return onDeactivateWorld;
  }
}
