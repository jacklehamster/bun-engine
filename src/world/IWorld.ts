import { SpriteId } from "./sprite/Sprite";
import { ImageId } from "gl/texture/ImageManager";
import { Refresh } from "updates/Refresh";
import { Medias } from "./sprite/Medias";
import { Sprites } from "./sprite/Sprites";
import { Camera } from "gl/camera/Camera";

export type UpdateType = "SpriteTransform" | "SpriteAnim" | "Media" | "Camera";
export type IdType = SpriteId | ImageId;

export interface ActivateProps {
  updateCallback: (type: UpdateType, id: IdType) => void;
}

interface IWorld extends Refresh {
  activate(activateProps: ActivateProps): (() => void);
  readonly sprites: Sprites;
  readonly medias: Medias;
  readonly camera: Camera;
}

export default IWorld;
