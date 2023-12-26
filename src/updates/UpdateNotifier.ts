import { IdType } from "core/Active";

export interface UpdateNotifier {
  informUpdate(id: IdType): void;
}
