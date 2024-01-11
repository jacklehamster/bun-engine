import { PositionMatrix } from "gl/transform/PositionMatrix";
import { TiltMatrix } from "gl/transform/TiltMatrix";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { Holder } from "world/aux/Holder";

export interface ICamera extends Holder<ICamera> {
  configProjectionMatrix(width: number, height: number): void;
  moveCam(x: number, y: number, z: number): void;
  readonly posMatrix: PositionMatrix;
  readonly tiltMatrix: TiltMatrix;
  readonly turnMatrix: TurnMatrix;
}
