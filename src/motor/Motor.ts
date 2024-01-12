import { Time } from "core/Time";
import { Refresh, UpdatePayload } from "../updates/Refresh";
import { IMotor } from "./IMotor";
import { Duration } from "core/Time";

/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MAX_DELTA_TIME = 1000 / 20;

export interface Schedule {
  triggerTime: Time;
  period: Duration;
  expirationTime: Time;
}

export class Motor implements IMotor {
  private readonly updateSchedule: Map<Refresh, Schedule> = new Map();
  time: Time = 0;
  holder?: Refresh;

  loop(update: Refresh, frameRate?: number, expirationTime?: Time) {
    this.registerUpdate(update, { period: frameRate ? 1000 / frameRate : 1, expirationTime });
  }

  registerUpdate(update: Refresh, schedule: Partial<Schedule> = {}) {
    schedule.triggerTime = schedule.triggerTime ?? this.time;
    schedule.expirationTime = schedule.expirationTime ?? Infinity;
    schedule.period = schedule.period;
    this.updateSchedule.set(update, schedule as Schedule);
  }

  deregisterUpdate(update: Refresh) {
    this.updateSchedule.delete(update);
  }

  deactivate(): void {
    if (this.holder) {
      this.deregisterUpdate(this.holder);
    }
    this.stopLoop?.();
  }

  activate() {
    if (!this.holder) {
      return;
    }
    let handle = 0;
    const updatePayload: UpdatePayload = {
      time: 0,
      deltaTime: 0,
    };
    const updates: Refresh[] = [];

    const loop: FrameRequestCallback = (time: Time) => {
      updatePayload.deltaTime = Math.min(time - updatePayload.time, MAX_DELTA_TIME);
      updatePayload.time = time;
      handle = requestAnimationFrame(loop);
      this.time = time;

      updates.length = 0;
      this.updateSchedule.forEach((schedule, update) => {
        if (time < schedule.triggerTime) {
          return;
        }
        updates.push(update);
        if (schedule.period && time < schedule.expirationTime) {
          schedule.triggerTime = Math.max(schedule.triggerTime + schedule.period, time);
        } else {
          this.updateSchedule.delete(update);
        }
      });
      updates.forEach(update => update.refresh?.(updatePayload));
    };
    requestAnimationFrame(loop);
    this.stopLoop = () => {
      cancelAnimationFrame(handle);
      this.stopLoop = undefined;
    };
    this.loop(this.holder);
  }

  stopLoop?(): void;
}
