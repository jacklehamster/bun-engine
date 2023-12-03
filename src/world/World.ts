import { Sprite } from "./Sprite";
import IWorld, { ActivateProps, IdType, UpdateType } from "./IWorld";
import { ImageId } from "gl/texture/ImageManager";
import { Camera } from "gl/camera/Camera";
import { Core } from "core/Core";
import { Media } from "gl/texture/Media";
import { UpdatePayload } from "updates/Update";

export abstract class World implements IWorld {
  constructor(public core: Core, protected readonly camera: Camera = core.camera) {
    this.getSprite = this.getSprite.bind(this);
    this.getMedia = this.getMedia.bind(this);
  }

  protected onUpdate(type: UpdateType, id: IdType): void {
    console.warn("pass onUpdate to inform about changes in the world.", type, id);
  }

  abstract getMedia(imageId: ImageId): Media | undefined;
  abstract getMaxSpriteCount(): number;
  abstract getSprite(index: number): Sprite;
  abstract update({ deltaTime }: UpdatePayload): void;
  abstract activate({ onUpdate }: ActivateProps): () => void;
}
