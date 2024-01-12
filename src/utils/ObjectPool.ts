export class ObjectPool<T, A extends any[] = any[]> {
  private allObjectsCreated: T[] = [];
  private recycler: T[] = [];
  constructor(private initCall: (elem: T | undefined, ...params: A) => T) {
  }

  recycle(element: T) {
    this.recycler.push(element);
  }

  create(...params: A): T {
    const recycledElem = this.recycler.pop();
    if (recycledElem) {
      return this.initCall(recycledElem, ...params);
    }

    const elem = this.initCall(undefined, ...params);
    this.allObjectsCreated.push(elem);
    return elem;
  }

  reset() {
    this.recycler.length = 0;
    this.recycler.push(...this.allObjectsCreated);
  }
}
