import { NumVal } from "progressive-value";
import { ProjectionMatrix, IPositionMatrix, IAngleMatrix } from "dok-matrix";
import { Active } from "dok-types";

export interface ICamera extends Active {
  readonly position: IPositionMatrix;
  readonly tilt: IAngleMatrix;
  readonly turn: IAngleMatrix;
  readonly projection: ProjectionMatrix;
  readonly curvature: NumVal;
  readonly distance: NumVal;
  readonly blur: NumVal;
  readonly fadeOut: () => Promise<void>;
  resizeViewport(width: number, height: number): void;
  setBackgroundColor(rgb: number): void;
}
