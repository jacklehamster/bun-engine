import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { Angle } from "gl/utils/angleUtils";
import { Auxiliary } from "world/aux/Auxiliary";
import { CellPos } from "world/grid/CellPos";

export interface ICamera extends Auxiliary {
  configProjectionMatrix(width: number, height: number): void;
  moveCam(x: number, y: number, z: number): void;
  turn(angle: Angle): void;
  tilt(angle: Angle): void;
  getPosition(): CellPos;
  readonly tiltMatrix: TiltMatrix;
  readonly turnMatrix: TurnMatrix;
  gotoPos(x: number, y: number, z: number, speed?: number): void;
  setPosition(x: number, y: number, z: number): void;
}
