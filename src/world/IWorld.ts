import { Holder } from "./aux/Holder";
import { Auxiliary } from "./aux/Auxiliary";

interface IWorld<T = Record<string, any>> extends Holder<IWorld>, Auxiliary {
  api?: T;
}

export default IWorld;
