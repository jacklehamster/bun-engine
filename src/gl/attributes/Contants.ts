import { LocationName } from "./GLAttributeBuffers";

//  GL
export type GL = WebGL2RenderingContext;
export const GL = WebGL2RenderingContext;

//  Attributes
export const POSITION_LOC: LocationName = "position";
export const INDEX_LOC: LocationName = "index";
export const TRANSFORM_LOC: LocationName = "transform";
export const TEX_LOC: LocationName = "tex";
export const SLOT_SIZE_LOC: LocationName = "slotSize";

//  Uniform
export const CAM_LOC: LocationName = "cam";
