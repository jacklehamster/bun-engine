import { SpriteId } from "world/sprite/Sprite";
import { MediaId } from "gl/texture/ImageManager";
import { MatrixUniform } from "./graphics/Uniforms";
import { FloatUniform } from "./graphics/Uniforms";

export type IdType = SpriteId | MediaId | MatrixUniform | FloatUniform;
