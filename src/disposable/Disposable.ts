interface Destroyable {
  destroy: () => void;
}

export class Disposable {
  disposables?: Set<Destroyable>;

  own<D extends Disposable>(disposable: D): D {
    if (!this.disposables) {
      this.disposables = new Set();
    }
    this.disposables.add(disposable);
    return disposable;
  }

  addOnDestroy(callback: () => void) {
    this.disposables?.add({
      destroy: callback,
    });
  }

  destroy() {
    this.disposables?.forEach((disposable) => disposable.destroy());
  }
}
