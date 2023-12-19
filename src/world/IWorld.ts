import { SpriteId, Sprites } from "./sprite/Sprite";
import { ImageId } from "gl/texture/ImageManager";
import { Update } from "updates/Update";
import { Media } from "gl/texture/Media";

export type UpdateType = "SpriteTransform" | "SpriteAnim" | "Media" | "Camera";
export type IdType = SpriteId | ImageId;

export interface ActivateProps {
  updateCallback: (type: UpdateType, id: IdType) => void;
}

interface IWorld extends Update {
  activate(activateProps: ActivateProps): (() => void);
  sprites: Sprites;
  getMedia(imageId: ImageId): Media | undefined;
}

export default IWorld;
