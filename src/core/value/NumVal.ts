import { Progressive } from "./Progressive";
import { Val } from "./Val";
import { IMotor, UpdatePayload } from "motor-loop";
import { ProgressivePool } from "./ProgressivePool";

const progressivePool = new ProgressivePool();

export class NumVal implements Val<number> {
  #value: number = 0;
  private progressive?: Progressive<NumVal>;

  constructor(value: number = 0, private onChange?: (value: number) => void) {
    this.#value = value;
  }

  valueOf(): number {
    return this.#value;
  }

  setValue(value: number): this {
    if (value !== this.#value) {
      this.#value = value;
      this.onChange?.(this.#value);
    }
    return this;
  }

  addValue(value: number): this {
    this.setValue(this.#value + value);
    return this;
  }

  update(deltaTime: number): boolean {
    if (this.progressive) {
      const didUpdate = !!this.progressive?.update(deltaTime);
      if (!didUpdate) {
        progressivePool.recycle(this.progressive);
        this.progressive = undefined;
      }
      return didUpdate;
    }
    return false;
  }

  refresh({ deltaTime, data, stopUpdate }: UpdatePayload<NumVal>) {
    if (!data.update(deltaTime)) {
      stopUpdate();
    }
  }

  progressTowards(goal: number, speed: number, locker?: any, motor?: IMotor) {
    if (!this.progressive) {
      this.progressive = progressivePool.create(this);
    }
    this.progressive.setGoal(goal, speed, locker);
    if (motor) {
      motor.loop(this, this);
    }
  }

  get goal(): number {
    return this.progressive?.goal ?? this.valueOf();
  }
}
