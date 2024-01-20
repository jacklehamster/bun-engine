export interface Box {
  get top(): number;
  get bottom(): number;
  get left(): number;
  get right(): number;
  get near(): number;
  get far(): number;
}
