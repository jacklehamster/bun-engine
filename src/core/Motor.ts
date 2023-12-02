import { Update, Updates } from "../updates/Update";

/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MAX_DELTA_TIME = 1000 / 20;

export interface Schedule {
  triggerTime?: number;
  period?: number;
  expirationTime?: number;
}

export class Motor {
  private readonly updateSchedule: Map<Updates, Schedule> = new Map();
  time: number = 0;

  loop(update: Updates, frameRate?: number, expirationTime?: number) {
    this.registerUpdate(update, { period: frameRate ? 1000 / frameRate : 1, expirationTime });
  }

  registerUpdate(update: Updates, schedule: Schedule = {}): void {
    schedule.triggerTime = schedule.triggerTime ?? this.time;
    schedule.expirationTime = schedule.expirationTime ?? Infinity;
    schedule.period = schedule.period;
    this.updateSchedule.set(update, schedule);
  }

  start() {
    let handle = 0;
    let lastTime = 0;
    const loop: FrameRequestCallback = (time) => {
      const deltaTime = Math.min(time - lastTime, MAX_DELTA_TIME);
      handle = requestAnimationFrame(loop);
      lastTime = time;
      this.time = time;
      this.updateSchedule.forEach((schedule, update) => {
        if (time < schedule.triggerTime!) {
          return;
        }
        const updates: Update[] = Array.isArray(update) ? update : [update];
        updates.forEach(update => update.update(this, deltaTime));
        if (schedule.period && time < schedule.expirationTime!) {
          schedule.triggerTime = Math.max(schedule.triggerTime! + schedule.period, time);
        } else {
          this.updateSchedule.delete(update);
        }
      });
    };
    requestAnimationFrame(loop);
    this.stop = () => {
      cancelAnimationFrame(handle);
      this.stop = () => { };
    }
  }

  stop: () => void = () => { };
}
