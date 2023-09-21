export class Disposable {
    disposables?: Set<Disposable>;

    own<D extends Disposable>(disposable: D): D {
        if (!this.disposables) {
            this.disposables = new Set();
        }
        this.disposables.add(disposable);
        return disposable;
    }

    destroy() {
        this.disposables?.forEach(disposable => disposable.destroy());
    }
}