import { Refresh } from "updates/Refresh";
import { ITimeProvider, Time } from "core/Time";
import { Auxiliary } from "world/aux/Auxiliary";

export interface IMotor extends Auxiliary<Refresh>, ITimeProvider {
  loop(update: Refresh, frameRate?: number, priority?: number, expirationTime?: Time): void;
  registerUpdate(update: Refresh, refreshRate?: number): void;
  deregisterUpdate(update: Refresh): void;
}
