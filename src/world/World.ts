import IWorld, { ActivateProps, IdType, UpdateType } from "./IWorld";
import { ImageId } from "gl/texture/ImageManager";
import { Camera } from "gl/camera/Camera";
import { Core } from "core/Core";
import { Media } from "gl/texture/Media";
import { UpdatePayload } from "updates/Update";
import { Sprites } from "./sprite/Sprite";

export abstract class World implements IWorld {
  constructor(public core: Core, protected readonly camera: Camera = core.camera) {
    this.getMedia = this.getMedia.bind(this);
  }

  protected informUpdate(type: UpdateType, id: IdType): void {
    console.warn("pass onUpdate to inform about changes in the world.", type, id);
  }

  abstract activate(activateProps: ActivateProps): (() => void);
  abstract getMedia(imageId: ImageId): Media | undefined;
  abstract update({ deltaTime }: UpdatePayload): void;
  abstract sprites: Sprites;
}
