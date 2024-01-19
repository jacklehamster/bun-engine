import { Sprite, copySprite } from "../Sprite";
import { Config, Grid } from "./Grid";
import { IElemFactory } from "./IElemFactory";

export class SpriteGrid extends Grid<Sprite> {
  constructor(config?: Config, ...factories: IElemFactory<Sprite>[]) {
    super(copySprite, config, ...factories);
  }
}
