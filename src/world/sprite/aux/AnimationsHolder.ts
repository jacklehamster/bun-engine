import { ElemsHolder } from "./ElemsHolder";
import { Animation } from "animation/Animation";
import { Animations } from "animation/Animations";

export interface AnimationsHolder extends Animations, ElemsHolder<Animation> {
}
