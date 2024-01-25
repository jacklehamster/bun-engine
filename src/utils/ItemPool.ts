export interface ItemPool<T, A extends any[] = []> {
  create(...params: A): T;
  recycle(element: T): undefined;
  reset(): void;
}
