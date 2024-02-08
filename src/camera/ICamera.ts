import { NumVal } from "core/value/NumVal";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { Auxiliary } from "world/aux/Auxiliary";

export interface ICamera extends Auxiliary {
  resizeViewport(width: number, height: number): void;
  readonly position: IPositionMatrix;
  readonly tilt: TiltMatrix;
  readonly turn: TurnMatrix;
  readonly projection: ProjectionMatrix;
  readonly curvature: NumVal;
  readonly distance: NumVal;
  readonly blur: NumVal;
  readonly fade: NumVal;
}
