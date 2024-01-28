export interface Queue<T> {
  pushTop(value: T): void;
  popBottom(): T | undefined;
  get size(): number;
}

export interface UpsidedownQueue<T> {
  pushBottom(value: T): void;
  popTop(): T | undefined;
  get size(): number;
}
