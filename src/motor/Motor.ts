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
const FRAME_PERIOD = 16.5;  //  base of 60fps
const MAX_LOOP_JUMP = 10;

interface Schedule {
  triggerTime: Time;
  period: Duration;
  frameRate: number;
  data: any;
}

interface Update {
  refresher: Refresh;
  data: any;
}

export class Motor implements IMotor {
  private readonly schedulePool = new SchedulePool();
  private readonly updatePool = new UpdatePool();
  private readonly schedule: Map<Refresh<any>, Schedule> = new Map();
  time: Time = 0;

  loop<T>(update: Refresh<T>, frameRate?: number, data?: T) {
    this.registerUpdate<T>(update, frameRate ?? 1000, data);
  }

  registerUpdate<T>(update: Refresh<T>, refreshRate: number = 0, data?: T) {
    const schedule = this.schedule.get(update);
    if (!schedule) {
      this.schedule.set(update, this.schedulePool.create(refreshRate, data));
    } else if (schedule.frameRate !== refreshRate) {
      schedule.frameRate = refreshRate;
      schedule.period = refreshRate ? 1000 / refreshRate : 0;
      schedule.data = data;
    }
  }

  deregisterUpdate<T>(update: Refresh<T>) {
    const schedule = this.schedule.get(update);
    if (schedule) {
      this.schedulePool.recycle(schedule);
    }
    this.schedule.delete(update);
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
      data: undefined,
      renderFrame: true,
    };
    const updateGroups: [Update[], Update[]] = [
      [], [],
    ];

    const performUpdate = (time: number, updatePayload: UpdatePayload, updatePool: UpdatePool) => {
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
        updateGroups[update.priority ?? Priority.DEFAULT].push(updatePool.create(update, schedule.data));
      });
      for (let updates of updateGroups) {
        for (let update of updates) {
          updatePayload.data = update.data;
          update.refresher.refresh?.(updatePayload);
        }
      }
      updateGroups[Priority.DEFAULT].length = 0;
      updateGroups[Priority.LAST].length = 0;
    }

    let timeOffset = 0;
    let gameTime = 0;
    const loop: FrameRequestCallback = (time) => {
      handle = requestAnimationFrame(loop);
      let loopCount = Math.ceil((time + timeOffset - gameTime) / FRAME_PERIOD);
      if (loopCount > MAX_LOOP_JUMP) {
        timeOffset -= FRAME_PERIOD * (loopCount - MAX_LOOP_JUMP);
        loopCount = MAX_LOOP_JUMP;
      }
      for (let i = 0; i < loopCount; i++) {
        gameTime += FRAME_PERIOD;
        updatePayload.renderFrame = i === loopCount - 1;
        performUpdate(gameTime, updatePayload, this.updatePool);
      }
      this.updatePool.reset();
    };
    let handle = requestAnimationFrame(loop);

    this.stopLoop = () => {
      cancelAnimationFrame(handle);
      this.stopLoop = undefined;
      this.updatePool.clear();
      this.schedulePool.clear();
    };
  }

  stopLoop?(): void;
}

class SchedulePool extends ObjectPool<Schedule, [number, any]> {
  constructor() {
    super((schedule, frameRate, data) => {
      if (!schedule) {
        return { triggerTime: 0, frameRate, period: frameRate ? MILLIS_IN_SEC / frameRate : 0, data }
      }
      schedule.triggerTime = 0;
      schedule.period = frameRate ? MILLIS_IN_SEC / frameRate : 0;
      schedule.frameRate = frameRate;
      schedule.data = data;
      return schedule;
    });
  }
}

class UpdatePool extends ObjectPool<Update, [Refresh, any]> {
  constructor() {
    super((update, refresher, data) => {
      if (!update) {
        return { refresher, data };
      }
      update.refresher = refresher;
      update.data = data;
      return update;
    })
  }
}
