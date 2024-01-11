export class ObjectPool<T, V> {
  private allObjectsCreated: T[] = [];
  private recycler: T[] = [];
  constructor(private initCall: (value: V, elem?: T) => T) {
  }

  recycle(element: T) {
    this.recycler.push(element);
  }

  create(value: V): T {
    const recycledElem = this.recycler.pop();
    if (recycledElem) {
      return this.initCall(value, recycledElem);
    }

    const elem = this.initCall(value);
    this.allObjectsCreated.push(elem);
    return elem;
  }

  reset() {
    this.recycler.length = 0;
    this.recycler.push(...this.allObjectsCreated);
  }
}
