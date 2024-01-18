import { SpriteId } from "world/sprite/Sprite";
import { MediaId } from "gl/texture/ImageManager";
import { MatrixUniform, VectorUniform } from "../graphics/Uniforms";
import { FloatUniform } from "../graphics/Uniforms";
import { AnimationId } from "animation/Animation";

export type IdType = SpriteId | MediaId | AnimationId | MatrixUniform | FloatUniform | VectorUniform;
