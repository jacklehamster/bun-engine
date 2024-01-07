import { Duration } from "core/Time";
import { Time } from "core/Time";
import { RefreshOrder } from "./RefreshOrder";

export interface UpdatePayload {
  time: Time;
  deltaTime: Duration;
}

export type Refresh = {
  readonly refresh: (updatePayload: UpdatePayload) => void;
  refreshOrder?: RefreshOrder;
}
