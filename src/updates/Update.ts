import { Motor } from "../core/Motor";

export interface UpdatePayload {
  deltaTime: number;
  readonly motor: Motor;
}

export type Update = {
  update(updatePayload: UpdatePayload): void;
}
