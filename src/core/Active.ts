import { SpriteId } from "world/sprite/Sprite";
import { Core } from "./Core";
import { MediaId } from "gl/texture/ImageManager";
import { CameraMatrixType } from "gl/camera/Camera";

export type IdType = SpriteId | MediaId | CameraMatrixType;

export interface Active {
  activate(core: Core): (() => void);
}
