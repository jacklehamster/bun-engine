import { Refresh, UpdatePayload } from "../updates/Refresh";

/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MAX_DELTA_TIME = 1000 / 20;

export type Time = number;
export type Duration = number;

export enum Priority {
  DEFAULT = 0,
  LAST = 1,
};

export interface Schedule {
  triggerTime: Time;
  period: Duration;
  expirationTime: Time;
  priority: Priority;
}

export class Motor {
  private readonly updateSchedule: Map<Refresh, Schedule> = new Map();
  time: Time = 0;

  loop(update: Refresh, frameRate?: number, priority?: number, expirationTime?: Time) {
    this.registerUpdate(update, { period: frameRate ? 1000 / frameRate : 1, expirationTime, priority });
  }

  registerUpdate(update: Refresh, schedule: Partial<Schedule> = {}): void {
    schedule.triggerTime = schedule.triggerTime ?? this.time;
    schedule.expirationTime = schedule.expirationTime ?? Infinity;
    schedule.period = schedule.period;
    schedule.priority = schedule.priority ?? Priority.DEFAULT;
    this.updateSchedule.set(update, schedule as Schedule);
  }

  start() {
    let handle = 0;
    const updatePayload: UpdatePayload = {
      time: 0,
      deltaTime: 0,
    };
    const normalUpdates: Refresh[] = [];
    const lastUpdates: Refresh[] = [];
    const updateList = [normalUpdates, lastUpdates];

    const loop: FrameRequestCallback = (time: Time) => {
      updatePayload.deltaTime = Math.min(time - updatePayload.time, MAX_DELTA_TIME);
      updatePayload.time = time;
      handle = requestAnimationFrame(loop);
      this.time = time;

      normalUpdates.length = 0;
      lastUpdates.length = 0;
      this.updateSchedule.forEach((schedule, update) => {
        if (time < schedule.triggerTime) {
          return;
        }
        updateList[schedule.priority].push(update);
        if (schedule.period && time < schedule.expirationTime) {
          schedule.triggerTime = Math.max(schedule.triggerTime + schedule.period, time);
        } else {
          this.updateSchedule.delete(update);
        }
      });
      updateList.forEach((updates) => updates.forEach((update) => update.refresh(updatePayload)));
    };
    requestAnimationFrame(loop);
    this.stop = () => {
      cancelAnimationFrame(handle);
      this.stop = () => { };
    }
  }

  stop: () => void = () => { };
}
