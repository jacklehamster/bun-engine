// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { LocationName } from './GLAttributeBuffers';

//  GL
export type GL = WebGL2RenderingContext | any;
export const GL = typeof globalThis.WebGL2RenderingContext !== undefined ? globalThis.WebGL2RenderingContext : {} as any;

//  Attributes
export const POSITION_TEX_LOC: LocationName = 'position_and_tex';
export const INDEX_LOC: LocationName = 'index';
export const TRANSFORM_LOC: LocationName = 'transform';
export const SLOT_SIZE_LOC: LocationName = 'slotSize_and_number';

//  Uniform
export const CAM_LOC: LocationName = 'cam';
export const PROJECTION_LOC: LocationName = 'projection';

export const DEBUG = false;
