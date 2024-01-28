import { Duration } from "motor/Time";
import { Time } from "motor/Time";
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
