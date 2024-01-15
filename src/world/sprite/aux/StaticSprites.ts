import { Auxiliary } from "world/aux/Auxiliary";
import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { SpritesHolder } from "./SpritesHolder";
import { forEach } from "../List";

export class StaticSprites implements Sprites, Auxiliary<SpritesHolder> {
  holder?: SpritesHolder;

  constructor(private sprites: Sprites) {
  }

  get length(): number {
    return this.sprites.length;
  }

  at(index: number): Sprite | undefined {
    return this.sprites.at(index);
  }

  informUpdate(_id: number, _type?: number | undefined): void {
    //  needs replacement
  }

  activate(): void {
    this.holder?.addSprites(this);
    forEach(this.sprites, (_, index) => this.informUpdate(index));
  }
}
