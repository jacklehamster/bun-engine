export interface Destroyable {
  destroy: () => void;
}

export class Disposable {
  disposables?: Set<Destroyable>;

  own<D extends Destroyable>(destroyable: D): D {
    if (!this.disposables) {
      this.disposables = new Set();
    }
    this.disposables.add(destroyable);
    return destroyable;
  }

  disown<D extends Destroyable>(destroyable: D): void {
    this.disposables?.delete(destroyable);
  }

  addOnDestroy(callback?: () => void) {
    if (callback) {
      this.disposables?.add({
        destroy: callback,
      });
    }
  }

  destroy() {
    this.disposables?.forEach((disposable) => disposable.destroy());
    this.disposables?.clear();
  }
}
