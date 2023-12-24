export interface List<T> {
  readonly length: number;
  at(index: number): T | undefined;
}

export function forEach<T>(list: List<T>, callback: (value: T, index: number) => void): void {
  for (let i = 0; i < list.length; i++) {
    const elem = list.at(i);
    if (elem) {
      callback(elem, i);
    }
  }
}
