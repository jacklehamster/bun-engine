// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { LocationName } from './GLAttributeBuffers';

//  GL
export type GL = WebGL2RenderingContext;
export const GL = globalThis.WebGL2RenderingContext ?? {} as any;

//  Attributes
export const POSITION_LOC: LocationName = 'position';
export const INDEX_LOC: LocationName = 'index';
export const TRANSFORM_LOC: LocationName = 'transform';
export const SLOT_SIZE_LOC: LocationName = 'slotSize_and_number';
export const INSTANCE_LOC: LocationName = 'instance';
export const SPRITE_FLAGS_LOC: LocationName = 'spriteFlag';

//  Uniform
export const CAM_POS_LOC: LocationName = 'camPos';
export const CAM_TILT_LOC: LocationName = 'camTilt';
export const CAM_TURN_LOC: LocationName = 'camTurn';
export const CAM_DISTANCE_LOC: LocationName = 'camDist';
export const CAM_PROJECTION_LOC: LocationName = 'projection';
export const CAM_CURVATURE_LOC: LocationName = 'curvature';
export const BG_COLOR_LOC: LocationName = 'bgColor';
export const MAX_TEXTURE_SIZE_LOC: LocationName = 'maxTextureSize';
export const TEXTURE_UNIFORM_LOC: LocationName = 'uTextures';
