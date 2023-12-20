import { Duration, Time } from "core/Motor";

export interface UpdatePayload {
  time: Time;
  deltaTime: Duration;
}

export type Refresh = {
  refresh(updatePayload: UpdatePayload): void;
}
