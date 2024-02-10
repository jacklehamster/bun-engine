import { NumVal } from "progressive-value";
import { ProjectionMatrix, IPositionMatrix, IAngleMatrix } from "dok-matrix";
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
