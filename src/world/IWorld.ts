import { Sprite, SpriteId } from "./Sprite";
import { ImageId } from "gl/texture/ImageManager";
import { Camera } from "gl/camera/Camera";
import { Update } from "updates/Update";
import { Media } from "gl/texture/Media";

export type UpdateType = "SpriteTransform" | "SpriteAnim" | "Media" | "Camera";
export type IdType = SpriteId | ImageId;

interface IWorld extends Update {
  activate(): (() => void);
  getMaxSpriteCount(): number;
  getCamera(): Camera;
  getSprite(spriteId: SpriteId): Sprite | undefined;
  getMedia(imageId: ImageId): Media | undefined;
  setOnUpdate(onUpdate: (type: UpdateType, id: IdType) => void): void;
}

export default IWorld;
