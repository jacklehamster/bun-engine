import { IdType } from "core/IdType";

export type UpdateType = number;

export interface IUpdateListener {
  onUpdate(id: IdType, type?: UpdateType): void;
}

export interface IUpdateNotifier {
  informUpdate(id: IdType, type?: UpdateType): void;
  addUpdateListener(listener: IUpdateListener): void;
  removeUpdateListener(listener: IUpdateListener): void;
}
