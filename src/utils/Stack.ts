export interface Stack<T> {
  pushTop(value: T): void;
  popTop(): T | undefined;
  get size(): number;
}
