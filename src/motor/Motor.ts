import { Time } from "core/Time";
import { Priority, Refresh, UpdatePayload } from "../updates/Refresh";
import { IMotor } from "./IMotor";
import { Duration } from "core/Time";
import { ObjectPool } from "utils/ObjectPool";

/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MILLIS_IN_SEC = 1000;
const MAX_DELTA_TIME = MILLIS_IN_SEC / 20;
const FRAME_PERIOD = 16.6;

interface Schedule {
  triggerTime: Time;
  period: Duration;
  expiration: Time;
}

export class Motor implements IMotor {
  private readonly updateSchedule: Map<Refresh, Schedule> = new Map();
  time: Time = 0;
  holder?: Refresh;
  private readonly pool = new SchedulePool();

  loop(update: Refresh, frameRate?: number, expirationTime?: Time) {
    this.registerUpdate(update, frameRate ?? 1000, expirationTime);
  }

  registerUpdate(update: Refresh, refreshRate: number = 0, expiration: Time = Infinity) {
    const schedule = this.updateSchedule.get(update);
    if (!schedule) {
      this.updateSchedule.set(update, this.pool.create(refreshRate, expiration));
    } else {
      schedule.period = refreshRate ? 1000 / refreshRate : 0;
      schedule.expiration = expiration;
    }
  }

  deregisterUpdate(update: Refresh) {
    const schedule = this.updateSchedule.get(update);
    if (schedule) {
      this.pool.recycle(schedule);
    }
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
    const updateGroups: [Refresh[], Refresh[]] = [
      [],
      [],
    ];

    let time = 0;
    // let counter = 0;
    const loop: FrameRequestCallback = () => {
      handle = requestAnimationFrame(loop);
      // counter++;
      // if (counter > 10) {
      //   counter = 0;
      // } else {
      //   return;
      // }
      time += FRAME_PERIOD;
      updatePayload.deltaTime = Math.min(time - updatePayload.time, MAX_DELTA_TIME);
      this.time = updatePayload.time = time;

      this.updateSchedule.forEach((schedule, update) => {
        if (time < schedule.triggerTime) {
          return;
        }
        if (schedule.period && time < schedule.expiration) {
          schedule.triggerTime = Math.max(schedule.triggerTime + schedule.period, time);
        } else {
          this.deregisterUpdate(update);
        }
        updateGroups[update.priority ?? Priority.DEFAULT].push(update);
      });
      for (let updates of updateGroups) {
        for (let update of updates) {
          update.refresh?.(updatePayload);
        }
      }
      updateGroups[Priority.DEFAULT].length = 0;
      updateGroups[Priority.LAST].length = 0;
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

class SchedulePool extends ObjectPool<Schedule, [number, Time]> {
  constructor() {
    super((schedule, frameRate, expiration) => {
      if (!schedule) {
        return { triggerTime: 0, period: frameRate ? MILLIS_IN_SEC / frameRate : 1, expiration: expiration }
      }
      schedule.triggerTime = 0;
      schedule.period = frameRate ? MILLIS_IN_SEC / frameRate : 0;
      schedule.expiration = expiration;
      return schedule;
    });
  }
}
