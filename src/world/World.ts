import IWorld, { ActivateProps, IdType, UpdateType } from "./IWorld";
import { Camera, CameraMatrixType } from "gl/camera/Camera";
import { Core } from "core/Core";
import { UpdatePayload } from "updates/Refresh";
import { Medias } from "./sprite/Medias";
import { Sprites } from "./sprite/Sprites";

export abstract class World implements IWorld {
  readonly camera: Camera = new Camera();

  constructor(protected core: Core) {
  }
  getCameraMatrix(type: CameraMatrixType): Float32Array {
    return this.camera.getCameraMatrix(type);
  }
  protected informUpdate(type: UpdateType, id: IdType): void {
    console.warn("pass onUpdate to inform about changes in the world.", type, id);
  }

  abstract activate(activateProps: ActivateProps): (() => void);
  abstract refresh({ deltaTime }: UpdatePayload): void;
  abstract sprites: Sprites;
  abstract medias: Medias;
}
