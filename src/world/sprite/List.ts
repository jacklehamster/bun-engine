export interface List<T> {
  readonly length: number;
  at(index: number): T | undefined;
}

export function forEach<T>(list: List<T> | undefined, callback: (value: T, index: number) => void): void {
  if (list) {
    for (let i = 0; i < list.length; i++) {
      const elem = list.at(i);
      if (elem) {
        callback(elem, i);
      }
    }
  }
}

export function map<T, R>(list: List<T>, callback: (value: T, index: number) => R): (R | undefined)[] {
  const r: (R | undefined)[] = []
  for (let i = 0; i < list.length; i++) {
    const elem = list.at(i);
    r.push(elem ? callback(elem, i) : undefined);
  }
  return r;
}
