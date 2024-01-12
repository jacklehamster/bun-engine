import { Holder } from "world/aux/Holder";
import { Sprites } from "../Sprites";

export interface SpritesHolder extends Sprites, Holder<SpritesHolder> {
  addSprites(...sprites: Sprites[]): void;
}
