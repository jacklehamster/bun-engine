import { IdType } from "core/IdType";

export interface UpdateNotifier {
  informUpdate(id: IdType): void;
}
