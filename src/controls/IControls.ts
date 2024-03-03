import { Auxiliary } from "world/aux/Auxiliary";
import { ControlsListener } from "./ControlsListener";

export enum StateEnum {
  PRESS_UP = 0,
  PRESS_DOWN = 1,
}

export interface IControls extends Auxiliary {
  get forward(): boolean;
  get backward(): boolean;
  get left(): boolean;
  get right(): boolean;
  get up(): boolean;
  get down(): boolean;
  get turnLeft(): boolean;
  get turnRight(): boolean;
  get action(): boolean;
  get exit(): boolean;
  addListener(listener: ControlsListener): void;
  removeListener(listener: ControlsListener): void;
  set enabled(active: boolean);
}
