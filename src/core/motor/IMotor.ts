import { Refresh } from "updates/Refresh";
import { Schedule, Time } from "./Motor";
import { Auxiliary } from "world/aux/Auxiliary";

export interface IMotor extends Auxiliary {
  activate(): () => void;
  loop(update: Refresh, frameRate?: number, priority?: number, expirationTime?: Time): () => void;
  registerUpdate(update: Refresh, schedule?: Partial<Schedule>): () => void;
  get time(): Time;
}
