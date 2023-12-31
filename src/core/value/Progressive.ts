export class Progressive<T> {
  private _goal: number;
  private active: boolean = false;
  private speed: number = 0;
  private locker?: any;
  constructor(private element: T, private getValue: (element: T) => number, private apply: (element: T, value: number) => void) {
    this._goal = this.getValue(element);
  }

  setGoal(value: number, speed: number, locker?: any) {
    if (this.locker && this.locker !== locker) {
      return;
    }
    if (this._goal !== value || this.speed !== speed) {
      this.speed = speed;
      this._goal = value;
      this.locker = locker;
      this.active = true;
    }
  }

  get goal() {
    return this._goal;
  }

  update(deltaTime: number): boolean {
    if (this.active) {
      const curValue = this.getValue(this.element);
      const diff = this.goal - curValue;
      const dDist = Math.min(Math.abs(diff), this.speed * deltaTime);
      if (dDist <= .01) {
        this.apply(this.element, this.goal);
        this.active = false;
        this.locker = undefined;
      } else {
        this.apply(this.element, curValue + dDist * Math.sign(diff));
      }
    }
    return this.active;
  }
}
