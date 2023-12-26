import { SpriteId } from "world/sprite/Sprite";
import { Core } from "./Core";
import { MediaId } from "gl/texture/ImageManager";
import { CameraMatrixType } from "gl/camera/Camera";

export type IdType = SpriteId | MediaId | CameraMatrixType;

export interface ActivateProps {
  core: Core;
}

export interface Active {
  activate(activateProps: ActivateProps): (() => void);
}
