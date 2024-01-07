import { Medias } from "./sprite/Medias";
import { Sprites } from "./sprite/Sprites";
import { Auxiliary } from "./aux/Auxiliary";
import { CellTrack } from "./grid/CellTracker";

interface IWorld extends Auxiliary, CellTrack {
  readonly sprites: Sprites;
  readonly medias: Medias;
}

export default IWorld;
