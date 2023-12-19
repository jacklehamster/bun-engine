export interface List<T> {
  readonly length: number;
  at(index: number): T | undefined;
}
