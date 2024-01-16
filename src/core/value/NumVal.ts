import { ObjectPool } from "utils/ObjectPool";
import { Progressive } from "./Progressive";
import { Val } from "./Val";
import { IMotor } from "motor/IMotor";
import { Refresh } from "updates/Refresh";

const progressivePool: ObjectPool<Progressive<NumVal>, [NumVal]> = new ObjectPool((progressive, val) => {
  if (!progressive) {
    return new Progressive(val, elem => elem.valueOf(), (elem, value) => elem.setValue(value));
  }
  progressive.element = val;
  return progressive;
});

export class NumVal implements Val<number> {
  private _value: number = 0;
  private progressive?: Progressive<NumVal>;

  constructor(value: number = 0, private onChange?: (value: number) => void) {
    this._value = value;
  }

  valueOf(): number {
    return this._value;
  }

  setValue(value: number): this {
    if (value !== this._value) {
      this._value = value;
      this.onChange?.(this._value);
    }
    return this;
  }

  addValue(value: number): this {
    this.setValue(this._value + value);
    return this;
  }

  update(deltaTime: number): boolean {
    return !!this.progressive?.update(deltaTime);
  }

  progressTowards(goal: number, speed: number, locker?: any, motor?: IMotor) {
    if (!this.progressive) {
      this.progressive = progressivePool.create(this);
    }
    this.progressive.setGoal(goal, speed, locker);
    if (motor) {
      const refresh: Refresh = {
        refresh: (updatePayload) => {
          if (!this.update(updatePayload.deltaTime)) {
            motor.deregisterUpdate(refresh);
          }
        },
      };
      motor.loop(refresh);
    }
  }

  get goal(): number {
    return this.progressive?.goal ?? this.valueOf();
  }
}
