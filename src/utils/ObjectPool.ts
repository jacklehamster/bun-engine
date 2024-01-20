export class ObjectPool<T, A extends any[] = []> {
  static warningLimit = 100000;

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
    this._recycler.length = 0;
    this._recycler.push(...this._allObjectsCreated);
  }

  destroy() {
    this._recycler.length = 0;
    this._allObjectsCreated.length = 0;
  }

  get totalObjectsInExistence() {
    return this._recycler.length + this._allObjectsCreated.length;
  }

  private checkObjectExistence() {
    if (this.totalObjectsInExistence === ObjectPool.warningLimit) {
      console.warn("ObjectPool already created", this.totalObjectsInExistence);
    }
  }
}
