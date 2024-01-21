export interface Box {
  get top(): number;
  get bottom(): number;
  get left(): number;
  get right(): number;
  get near(): number;
  get far(): number;
}

export const NULLBOX: Box = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  near: 0,
  far: 0
};
