import { Refresh } from "updates/Refresh";
import { Medias } from "./sprite/Medias";
import { Sprites } from "./sprite/Sprites";
import { Active } from "core/Active";

interface IWorld extends Refresh, Active {
  readonly sprites: Sprites;
  readonly medias: Medias;
}

export default IWorld;
