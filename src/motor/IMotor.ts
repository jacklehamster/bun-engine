import { Refresh } from "updates/Refresh";
import { ITimeProvider } from "core/Time";

export interface IMotor extends ITimeProvider {
  loop<T>(update: Refresh<T>, frameRate?: number, data?: T): void;
  registerUpdate<T>(update: Refresh<T>, refreshRate?: number, data?: T): void;
  deregisterUpdate<T>(update: Refresh<T>): void;
}
