import { ItemPool } from "./ItemPool";

export class ObjectPool<T, A extends any[] = []> implements ItemPool<T, A> {
  static warningLimit = 50000;

  private readonly _usedObjects: Set<T> = new Set();
  private readonly _recycler: T[] = [];
  constructor(private initCall: (elem: T | undefined, ...params: A) => T, private onRecycle?: (elem: T) => void) {
  }

  recycle(element: T): undefined {
    this._usedObjects.delete(element);
    this._recycler.push(element);
    this.onRecycle?.(element);
  }

  create(...params: A): T {
    const recycledElem = this._recycler.pop();
    if (recycledElem) {
      return this.initCall(recycledElem, ...params);
    }
    const elem = this.initCall(undefined, ...params);
    this._usedObjects.add(elem);
    this.checkObjectExistence();
    return elem;
  }

  reset() {
    for (const elem of this._usedObjects) {
      this._recycler.push(elem);
    }
    this._usedObjects.clear();
  }

  clear() {
    //  dispose of objects, leave it to garbage collector
    this._recycler.length = 0;
    this._usedObjects.clear();
  }

  private checkObjectExistence() {
    if (this._usedObjects.size + this._recycler.length === ObjectPool.warningLimit) {
      console.warn("ObjectPool already created", this._usedObjects.size + this._recycler.length, "in", this.constructor.name);
    }
    if (this._usedObjects.size + this._recycler.length > count) {
      count = this._usedObjects.size + this._recycler.length + 1000;
      console.warn("ObjectPool already created", this._usedObjects.size, "used", this._recycler.length, "recycled in", this.constructor.name);
    }
  }
}

let count = 0;
