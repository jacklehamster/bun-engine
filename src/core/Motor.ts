import { Update, UpdatePayload } from "../updates/Update";

/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MAX_DELTA_TIME = 1000 / 20;
export enum Priority {
  DEFAULT = 0,
  LAST = 1,
};

export interface Schedule {
  triggerTime: number;
  period: number;
  expirationTime: number;
  priority: Priority;
}

export class Motor {
  private readonly updateSchedule: Map<Update, Schedule> = new Map();
  time: number = 0;

  loop(update: Update, frameRate?: number, priority?: number, expirationTime?: number) {
    this.registerUpdate(update, { period: frameRate ? 1000 / frameRate : 1, expirationTime, priority });
  }

  registerUpdate(update: Update, schedule: Partial<Schedule> = {}): void {
    schedule.triggerTime = schedule.triggerTime ?? this.time;
    schedule.expirationTime = schedule.expirationTime ?? Infinity;
    schedule.period = schedule.period;
    schedule.priority = schedule.priority ?? Priority.DEFAULT;
    this.updateSchedule.set(update, schedule as Schedule);
  }

  start() {
    let handle = 0;
    let lastTime = 0;
    const updatePayload: UpdatePayload = {
      deltaTime: 0,
      motor: this,
    };
    const normalUpdates: Update[] = [];
    const lastUpdates: Update[] = [];
    const updateList = [normalUpdates, lastUpdates];

    const loop: FrameRequestCallback = (time) => {
      updatePayload.deltaTime = Math.min(time - lastTime, MAX_DELTA_TIME);
      handle = requestAnimationFrame(loop);
      lastTime = time;
      this.time = time;

      normalUpdates.length = 0;
      lastUpdates.length = 0;
      this.updateSchedule.forEach((schedule, update) => {
        if (time < schedule.triggerTime!) {
          return;
        }
        updateList[schedule.priority].push(update);
        if (schedule.period && time < schedule.expirationTime!) {
          schedule.triggerTime = Math.max(schedule.triggerTime! + schedule.period, time);
        } else {
          this.updateSchedule.delete(update);
        }
      });
      updateList.forEach((updates) => updates.forEach((update) => update.update(updatePayload)));
    };
    requestAnimationFrame(loop);
    this.stop = () => {
      cancelAnimationFrame(handle);
      this.stop = () => { };
    }
  }

  stop: () => void = () => { };
}
