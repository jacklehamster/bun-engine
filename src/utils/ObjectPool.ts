export class ObjectPool<T, A extends any[] = []> {
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
    if (this.allObjectsCreated.length === 10000) {
      console.warn("ObjectPool already created", this.allObjectsCreated.length);
    }
    return elem;
  }

  reset() {
    this.recycler.length = 0;
    this.recycler.push(...this.allObjectsCreated);
  }
}
