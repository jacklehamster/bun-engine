import { NumVal } from "core/value/NumVal";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { Auxiliary } from "world/aux/Auxiliary";

export interface ICamera extends Auxiliary {
  readonly position: IPositionMatrix;
  readonly tilt: IAngleMatrix;
  readonly turn: IAngleMatrix;
  readonly projection: ProjectionMatrix;
  readonly curvature: NumVal;
  readonly distance: NumVal;
  readonly blur: NumVal;
  readonly fade: NumVal;
  resizeViewport(width: number, height: number): void;
  setBackgroundColor(rgb: number): void;
}
