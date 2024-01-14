import { PositionMatrix } from "gl/transform/PositionMatrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { Auxiliary } from "world/aux/Auxiliary";
import { Holder } from "world/aux/Holder";

export interface ICamera extends Holder<ICamera>, Auxiliary {
  resizeViewport(width: number, height: number): void;
  moveCam(x: number, y: number, z: number): void;
  readonly position: PositionMatrix;
  readonly tilt: TiltMatrix;
  readonly turn: TurnMatrix;
  readonly projection: ProjectionMatrix;
}
