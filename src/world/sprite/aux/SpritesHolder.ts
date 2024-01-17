import { Sprite } from "../Sprite";
import { Sprites } from "../Sprites";
import { ElemsHolder } from "./ElemsHolder";

export interface SpritesHolder extends Sprites, ElemsHolder<Sprite> {
}
