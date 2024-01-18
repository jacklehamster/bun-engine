import { ElemsHolder } from "./ElemsHolder";
import { Animation, Animations } from "animation/Animation";

export interface AnimationsHolder extends Animations, ElemsHolder<Animation> {
}
