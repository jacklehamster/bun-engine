import { Time } from "core/Time";
import { Refresh, UpdatePayload } from "../updates/Refresh";
import { IMotor } from "./IMotor";
import { Duration } from "core/Time";
import { ObjectPool } from "utils/ObjectPool";
import { Priority } from "updates/Priority";

/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MILLIS_IN_SEC = 1000;
const MAX_DELTA_TIME = MILLIS_IN_SEC / 20;
const FRAME_PERIOD = 16.6;

interface Schedule {
  triggerTime: Time;
  period: Duration;
  frameRate: number;
}

export class Motor implements IMotor {
  private readonly pool = new SchedulePool();
  private readonly schedule: Map<Refresh, Schedule> = new Map();
  time: Time = 0;

  loop(update: Refresh, frameRate?: number) {
    this.registerUpdate(update, frameRate ?? 1000);
  }

  registerUpdate(update: Refresh, refreshRate: number = 0) {
    const schedule = this.schedule.get(update);
    if (!schedule) {
      this.schedule.set(update, this.pool.create(refreshRate));
      //      console.log("schedule size:", this.schedule.size);
    } else if (schedule.frameRate !== refreshRate) {
      schedule.frameRate = refreshRate;
      schedule.period = refreshRate ? 1000 / refreshRate : 0;
    }
  }

  deregisterUpdate(update: Refresh) {
    const schedule = this.schedule.get(update);
    if (schedule) {
      this.pool.recycle(schedule);
    }
    this.schedule.delete(update);
    // console.log("schedule size:", this.schedule.size, "deregistering", update);
  }

  deactivate(): void {
    this.stopLoop?.();
  }

  activate() {
    this.startLoop();
  }

  startLoop() {
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

      this.schedule.forEach((schedule, update) => {
        if (time < schedule.triggerTime) {
          return;
        }
        if (schedule.period) {
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
    let handle = requestAnimationFrame(loop);
    this.stopLoop = () => {
      cancelAnimationFrame(handle);
      this.stopLoop = undefined;
    };
  }

  stopLoop?(): void;
}

class SchedulePool extends ObjectPool<Schedule, [number]> {
  constructor() {
    super((schedule, frameRate) => {
      if (!schedule) {
        return { triggerTime: 0, frameRate, period: frameRate ? MILLIS_IN_SEC / frameRate : 0 }
      }
      schedule.triggerTime = 0;
      schedule.period = frameRate ? MILLIS_IN_SEC / frameRate : 0;
      schedule.frameRate = frameRate;
      return schedule;
    });
  }
}
