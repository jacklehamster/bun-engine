import { Queue, UpsidedownQueue } from "./Queue";
import { Stack } from "./Stack";

export interface FreeStack<T> extends Stack<T>, Queue<T>, UpsidedownQueue<T> {
  contains(value: T): boolean;
  clear(): void;
}
