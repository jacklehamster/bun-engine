export class ObjectPool<T, A extends any[] = []> {
  static warningLimit = 50000;

  private readonly _allObjectsCreated: T[] = [];
  private readonly _recycler: T[] = [];
  constructor(private initCall: (elem: T | undefined, ...params: A) => T, private onCreate?: (elem: T) => void) {
  }

  recycle(element: T) {
    this._recycler.push(element);
    this.checkObjectExistence();
  }

  create(...params: A): T {
    const recycledElem = this._recycler.pop();
    if (recycledElem) {
      return this.initCall(recycledElem, ...params);
    }

    const elem = this.initCall(undefined, ...params);
    this._allObjectsCreated.push(elem);
    this.checkObjectExistence();
    this.onCreate?.(elem);
    return elem;
  }

  reset() {
    for (let i = 0; i < this._allObjectsCreated.length; i++) {
      this._recycler[i] = this._allObjectsCreated[i];
    }
  }

  clear() {
    this._recycler.length = 0;
    this._allObjectsCreated.length = 0;
  }

  private checkObjectExistence() {
    if (this._allObjectsCreated.length === ObjectPool.warningLimit) {
      console.warn("ObjectPool already created", this._allObjectsCreated.length);
    }
  }
}
