import { IdType } from "core/IdType";

type UpdateType = number;

export interface UpdateNotifier {
  informUpdate(id: IdType, type?: UpdateType): void;
}
