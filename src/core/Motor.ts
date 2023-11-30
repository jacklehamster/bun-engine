/**
 * Continously runs a loop which feeds a world into the GL Engine.
 */
const MAX_DELTA_TIME = 1000 / 20;

export type Update = {
  triggerTime?: number;
  update(motor: Motor, deltaTime?: number): void;
  period?: number;
}

export class Motor {
  private readonly updates: Set<Update> = new Set();
  time: number = 0;

  addUpdate(update: Update, triggerTime?: number): void {
    update.triggerTime = triggerTime ?? this.time;
    this.updates.add(update);
  }

  start() {
    let handle = 0;
    let lastTime = 0;
    const loop: FrameRequestCallback = (time) => {
      const deltaTime = Math.min(time - lastTime, MAX_DELTA_TIME);
      handle = requestAnimationFrame(loop);
      lastTime = time;
      this.time = time;
      this.updates.forEach(update => {
        if (time < update.triggerTime!) {
          return;
        }
        update.update(this, deltaTime);
        if (update.period) {
          update.triggerTime = Math.max(update.triggerTime! + update.period, time);
        } else {
          this.updates.delete(update);
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
