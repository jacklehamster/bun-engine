import { IPositionMatrix } from "dok-matrix";
import { IBodyModel } from "./IBodyModel";

export interface IBody {
  model: IBodyModel;
  position: IPositionMatrix;
}
