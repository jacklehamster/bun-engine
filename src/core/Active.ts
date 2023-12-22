import { SpriteId } from "world/sprite/Sprite";
import { Core } from "./Core";
import { MediaId } from "gl/texture/ImageManager";
import { CameraMatrixType } from "gl/camera/Camera";

export type UpdateType = "SpriteTransform" | "SpriteAnim" | "Media" | "CameraMatrix";
export type IdType = SpriteId | MediaId | CameraMatrixType;

export interface ActivateProps {
  core: Core;
  updateCallback(type: UpdateType, id: IdType): void;
}

export interface Active {
  activate(activateProps: ActivateProps): (() => void);
}
