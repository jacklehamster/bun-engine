import { Duration } from "core/Time";
import { Time } from "core/Time";

export interface UpdatePayload {
  time: Time;
  deltaTime: Duration;
}

export enum Priority {
  DEFAULT = 0,
  LAST = 1,
};

export type Refresh = {
  readonly refresh?: (updatePayload: UpdatePayload) => void;
  priority?: Priority;
}
