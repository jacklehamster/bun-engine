import { ItemPool } from "./ItemPool";

export class ObjectPool<T, A extends any[] = []> implements ItemPool<T, A> {
  static warningLimit = 50000;

  readonly #usedObjects: Set<T> = new Set();
  readonly #recycler: T[] = [];
  constructor(private initCall: (elem: T | undefined, ...params: A) => T, private onRecycle?: (elem: T) => void) {
  }

  create(...params: A): T {
    const recycledElem = this.#recycler.pop();
    if (recycledElem) {
      return this.initCall(recycledElem, ...params);
    }
    const elem = this.initCall(undefined, ...params);
    this.#usedObjects.add(elem);
    this.checkObjectExistence();
    return elem;
  }

  recycle(element: T): undefined {
    this.#usedObjects.delete(element);
    this.#recycler.push(element);
    this.onRecycle?.(element);
  }

  recycleAll() {
    for (const elem of this.#usedObjects) {
      this.#recycler.push(elem);
    }
    this.#usedObjects.clear();
  }

  clear() {
    //  dispose of objects, leave it to garbage collector
    this.#recycler.length = 0;
    this.#usedObjects.clear();
  }

  private checkObjectExistence() {
    if (this.#usedObjects.size + this.#recycler.length === ObjectPool.warningLimit) {
      console.warn("ObjectPool already created", this.#usedObjects.size + this.#recycler.length, "in", this.constructor.name);
    }
  }
}
