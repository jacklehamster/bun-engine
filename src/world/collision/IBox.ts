import { Vector } from "dok-types";

export interface IBox {
  get top(): number;
  get bottom(): number;
  get left(): number;
  get right(): number;
  get near(): number;
  get far(): number;
  readonly disabled?: boolean;
}

export const NULLBOX: IBox = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  near: 0,
  far: 0,
  disabled: false,
};
