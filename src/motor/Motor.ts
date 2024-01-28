import { Time } from "core/Time";
import { Refresh } from "../updates/Refresh";
import { UpdatePayload } from "updates/UpdatePayload";
import { IMotor } from "./IMotor";
import { Duration } from "core/Time";
import { Priority } from "updates/Priority";
import { MapPool } from "world/pools/MapPool";
import { ObjectPool } from "bun-pool";

/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MILLIS_IN_SEC = 1000;
const MAX_DELTA_TIME = MILLIS_IN_SEC / 20;
const FRAME_PERIOD = 16.5;  //  base of 60fps
const MAX_LOOP_JUMP = 10;

interface Appointment {
  meetingTime: Time;
  period: Duration;
  frameRate: number;
  data: any;
}

type Schedule = Map<Refresh<any>, Appointment>;

export class Motor implements IMotor {
  private readonly apptPool = new AppointmentPool();
  private readonly schedulePool = new MapPool<Refresh<any>, Appointment>();
  private schedule: Schedule = this.schedulePool.create();
  time: Time = 0;

  loop<T>(update: Refresh<T>, data: T, frameRate?: number) {
    this.scheduleUpdate<T>(update, data, frameRate ?? 1000);
  }

  scheduleUpdate<T>(update: Refresh<T>, data?: T, refreshRate: number = 0, future?: boolean) {
    let appt = this.schedule.get(update);
    if (!appt) {
      this.schedule.set(update, appt = this.apptPool.create(refreshRate, data));
    } else if (appt.frameRate !== refreshRate) {
      appt.frameRate = refreshRate;
      appt.period = refreshRate ? 1000 / refreshRate : 0;
      appt.data = data;
    }
    if (future) {
      appt.meetingTime = this.time + FRAME_PERIOD;
    }
  }

  stopUpdate<T>(update: Refresh<T>) {
    const appt = this.schedule.get(update);
    if (appt) {
      this.apptPool.recycle(appt);
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
      motor: this,
      refresher: { refresh: () => { } },
      stopUpdate() {
        this.motor.stopUpdate(this.refresher);
      },
    };
    updatePayload.stopUpdate = updatePayload.stopUpdate.bind(updatePayload);

    const performUpdate = (time: number, updatePayload: UpdatePayload) => {
      updatePayload.deltaTime = Math.min(time - updatePayload.time, MAX_DELTA_TIME);
      this.time = updatePayload.time = time;

      let agenda: Schedule | undefined = this.schedule;
      const futureSchedule = this.schedulePool.create();
      const finalSchedule = this.schedulePool.create();

      let limit = 100;
      let final = false;
      while (agenda) {
        if (limit-- < 0) {
          throw new Error("We keep scheduling updates within updates.");
        }
        this.schedule = this.schedulePool.create();
        agenda.forEach((appt, update) => {
          if (time < appt.meetingTime) {
            futureSchedule.set(update, appt);
            return;
          }
          if (!final && update.priority === Priority.LAST) {
            finalSchedule.set(update, appt);  //  defer
            return;
          }
          updatePayload.data = appt.data;
          updatePayload.refresher = update;
          update.refresh(updatePayload);
          if (appt.period) {
            appt.meetingTime = Math.max(appt.meetingTime + appt.period, time);
            futureSchedule.set(update, appt);
          } else {
            this.apptPool.recycle(appt);
          }
        });
        this.schedulePool.recycle(agenda);

        //  agenda complete. Check if other updates got scheduled
        if (!final) {
          if (this.schedule.size) {
            agenda = this.schedule;
          } else {
            this.schedulePool.recycle(this.schedule);
            final = true;
            agenda = finalSchedule;
          }
        } else {
          this.schedulePool.recycle(this.schedule);
          agenda = undefined;
          this.schedule = futureSchedule;
        }
      }
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
        performUpdate(gameTime, updatePayload);
      }
    };
    let handle = requestAnimationFrame(loop);

    this.stopLoop = () => {
      cancelAnimationFrame(handle);
      this.stopLoop = undefined;
      this.apptPool.clear();
    };
  }

  stopLoop?(): void;
}

class AppointmentPool extends ObjectPool<Appointment, [number, any]> {
  constructor() {
    super((appt, frameRate, data) => {
      if (!appt) {
        return { meetingTime: 0, frameRate, period: frameRate ? MILLIS_IN_SEC / frameRate : 0, data }
      }
      appt.meetingTime = 0;
      appt.period = frameRate ? MILLIS_IN_SEC / frameRate : 0;
      appt.frameRate = frameRate;
      appt.data = data;
      return appt;
    });
  }
}
