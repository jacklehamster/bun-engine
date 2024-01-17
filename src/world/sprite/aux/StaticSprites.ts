import { Auxiliary } from "world/aux/Auxiliary";
import { Sprites } from "../Sprites";
import { Sprite } from "../Sprite";
import { SpritesHolder } from "./SpritesHolder";
import { forEach } from "../List";
import { SpriteUpdateType } from "../update/SpriteUpdateType";

export class StaticSprites implements Sprites, Auxiliary<SpritesHolder> {
  holder?: SpritesHolder;

  constructor(private sprites: Sprites | Sprite[]) {
  }

  get length(): number {
    return this.sprites.length;
  }

  at(index: number): Sprite | undefined {
    return this.sprites.at(index);
  }

  informUpdate(_id: number, _type?: SpriteUpdateType | undefined): void {
    //  needs replacement
  }

  activate(): void {
    this.holder?.add(this);
    forEach(this.sprites, (_, index) => this.informUpdate(index));
  }
}
