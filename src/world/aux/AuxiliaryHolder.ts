import { Refresh, UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { Disposable } from "lifecycle/Disposable";

export class AuxiliaryHolder extends Disposable implements Auxiliary {
  private auxiliaries: Auxiliary[] = [];
  private refreshes: Refresh[] = [];
  private active: boolean = false;
  constructor() {
    super();
  }

  activate(): () => void {
    if (this.active) {
      return () => { };
    }
    const deactivates = new Set<() => void>();
    for (const a of this.auxiliaries) {
      const onDeactivate = a.activate?.();
      if (onDeactivate) {
        deactivates.add(onDeactivate);
      }
    }
    return () => {
      deactivates.forEach(d => d());
    };
  }

  deactivate() {
    if (!this.active) {
      return;
    }
    for (const a of this.auxiliaries) {
      a.deactivate?.();
    }
  }

  refresh(updatePayload: UpdatePayload): void {
    for (const r of this.refreshes) {
      r.refresh(updatePayload);
    }
  }

  onAddAuxiliary?(...aux: Auxiliary[]): () => void;
  addAuxiliary(...aux: Auxiliary[]) {
    this.auxiliaries.push(...aux);
    this.refreshes.push(...aux.filter((a): a is Refresh => !!a.refresh));
    const onDeactivates = new Set<() => void>();
    if (this.active) {
      for (const a of this.auxiliaries) {
        const onDeactivate = a.activate?.();
        if (onDeactivate) {
          onDeactivates.add(onDeactivate);
        }
      }
    }
    const onAddDeactivate = this.onAddAuxiliary?.(...aux);
    if (onAddDeactivate) {
      onDeactivates.add(onAddDeactivate);
    }
    return () => onDeactivates.forEach(d => d());
  }

  removeAllAuxiliaries() {
    this.removeAuxiliary(...this.auxiliaries);
  }

  removeAuxiliary(...aux: Auxiliary[]) {
    const removeSet = new Set(aux);
    let j = 0;
    for (let i = 0; i < this.auxiliaries.length; i++) {
      if (!removeSet.has(this.auxiliaries[i])) {
        this.auxiliaries[j] = this.auxiliaries[i];
        j++;
      }
    }
    this.auxiliaries.length = j;
    this.refreshes = this.auxiliaries.filter((a): a is Refresh => !!a.refresh);
  }
}
