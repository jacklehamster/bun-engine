import { TextureUpdate } from "updates/TextureUpdate";
import { IdType } from "../core/Active";
import { SpriteTransformUpdate } from "updates/SpriteTransformUpdate";
import { SpriteAnimUpdate } from "updates/SpriteAnimUpdate";
import { CameraUpdate } from "updates/CameraUpdate";
import { Motor } from "../core/Motor";
import IWorld from "world/IWorld";
import { Camera, CameraMatrixType } from "gl/camera/Camera";
import { GraphicsEngine } from "../core/GraphicsEngine";
import { SpriteId } from "world/sprite/Sprite";
import { MediaId } from "gl/texture/ImageManager";

export type UpdateType = "SpriteTransform" | "SpriteAnim" | "Media" | "CameraMatrix";

export class UpdateManager {
  private onUpdates: Record<UpdateType, (id: IdType) => void>;

  constructor(motor: Motor, camera: Camera, engine: GraphicsEngine, world: IWorld) {
    //  Register updates
    const textureImageUpdate = new TextureUpdate(motor, world.medias.at.bind(world.medias), engine);
    const spriteTransformUpdate = new SpriteTransformUpdate(world.sprites.at.bind(world.sprites), engine);
    const spriteAnimUpdate = new SpriteAnimUpdate(motor, world.sprites.at.bind(world.sprites), engine);
    const cameraMatrixUpdate = new CameraUpdate(camera.getCameraMatrix.bind(camera), engine);
    this.onUpdates = {
      ["SpriteAnim"]: (id: SpriteId) => motor.registerUpdate(spriteAnimUpdate.withSpriteId(id)),
      ["SpriteTransform"]: (id: SpriteId) => motor.registerUpdate(spriteTransformUpdate.withSpriteId(id)),
      ["Media"]: (id: MediaId) => motor.registerUpdate(textureImageUpdate.withImageId(id)),
      ["CameraMatrix"]: (type: CameraMatrixType) => motor.registerUpdate(cameraMatrixUpdate.withCameraType(type)),
    };
  }

  informUpdate(type: UpdateType, id: IdType): void {
    this.onUpdates[type](id);
  }
}
