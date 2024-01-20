import { Duration } from "core/Time";
import { Time } from "core/Time";
import { IMotor } from "motor/IMotor";
import { Refresh } from "./Refresh";


export interface UpdatePayload<T = undefined> {
  time: Time;
  deltaTime: Duration;
  data: T;
  renderFrame: boolean;
  motor: IMotor;
  refresher: Refresh;
  stopUpdate(): void;
}
