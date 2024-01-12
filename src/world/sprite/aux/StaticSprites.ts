import { Auxiliary } from "world/aux/Auxiliary";
import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { SpritesHolder } from "./SpritesHolder";

export class StaticSprites implements Sprites, Auxiliary<SpritesHolder> {
  holder?: SpritesHolder;

  constructor(private sprites: Sprites) {
    this.informUpdate = sprites.informUpdate?.bind(sprites);
  }

  get length(): number {
    return this.sprites.length;
  }

  at(index: number): Sprite | undefined {
    return this.sprites.at(index);
  }

  informUpdate?(id: number, type?: number | undefined): void;

  activate(): void {
    this.holder?.addSprites(this);
  }
}
