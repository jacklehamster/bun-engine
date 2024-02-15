import { IdType } from "dok-types";

export type UpdateType = number;
export const NO_UPDATE: UpdateType = 0;
export const FULL_UPDATE: UpdateType = -1;

export interface IUpdateListener {
  onUpdate(id: IdType, type?: UpdateType): void;
}

export interface IUpdateNotifier {
  informUpdate(id: IdType, type?: UpdateType): void;
  addUpdateListener(listener: IUpdateListener): void;
  removeUpdateListener(listener: IUpdateListener): void;
}
