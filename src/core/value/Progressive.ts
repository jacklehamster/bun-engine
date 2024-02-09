export class Progressive<T> {
  #goal: number;
  #active: boolean = false;
  #speed: number = 0;
  #locker?: any;
  #element: T;

  constructor(element: T, private getValue: (element: T) => number, private apply: (element: T, value: number) => void) {
    this.#element = element;
    this.#goal = this.getValue(element);
  }

  set element(element: T) {
    this.#element = element;
    this.#goal = this.getValue(element);
    this.#locker = undefined;
  }

  setGoal(value: number, speed: number, locker?: any) {
    if (this.#locker && this.#locker !== locker) {
      return;
    }
    if (this.#goal !== value || this.#speed !== speed) {
      this.#speed = speed;
      this.#goal = value;
      this.#locker = locker;
      this.#active = true;
    }
  }

  get goal() {
    return this.#goal;
  }

  update(deltaTime: number): boolean {
    if (this.#active) {
      const curValue = this.getValue(this.#element);
      const diff = this.goal - curValue;
      const dDist = Math.min(Math.abs(diff), this.#speed * deltaTime);
      if (dDist <= .01) {
        this.apply(this.#element, this.goal);
        this.#active = false;
        this.#locker = undefined;
      } else {
        this.apply(this.#element, curValue + dDist * Math.sign(diff));
      }
    }
    return this.#active;
  }
}
