import { Medias } from "./sprite/Medias";
import { Sprites } from "./sprite/Sprites";
import { CellTrack } from "./grid/CellTracker";
import { Holder as Holder } from "./aux/Holder";

interface IWorld extends Holder, CellTrack {
  readonly sprites: Sprites;
  readonly medias: Medias;
  addSprites(...sprites: Sprites[]): void;
}

export default IWorld;
