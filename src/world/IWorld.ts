import { Auxiliary } from "./aux/Auxiliary";

interface IWorld<T = Record<string, any>> extends Auxiliary {
  api?: T;
}

export default IWorld;
