import { Medias } from "./sprite/Medias";
import { Sprites } from "./sprite/Sprites";
import { Auxiliary } from "./aux/Auxiliary";

interface IWorld extends Auxiliary {
  readonly sprites: Sprites;
  readonly medias: Medias;
}

export default IWorld;
