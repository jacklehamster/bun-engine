import { Refresh } from "updates/Refresh";
import { Schedule } from "./Motor";
import { ITimeProvider, Time } from "core/Time";
import { Auxiliary } from "world/aux/Auxiliary";

export interface IMotor extends Auxiliary, ITimeProvider {
  activate(): () => void;
  loop(update: Refresh, frameRate?: number, priority?: number, expirationTime?: Time): () => void;
  registerUpdate(update: Refresh, schedule?: Partial<Schedule>): () => void;
}
