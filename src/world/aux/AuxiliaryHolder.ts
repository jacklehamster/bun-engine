import { Refresh, UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { Disposable } from "lifecycle/Disposable";
import { Cell } from "world/grid/CellPos";
import { CellTrack } from "world/grid/CellTracker";

export class AuxiliaryHolder extends Disposable implements Auxiliary {
  private auxiliaries: Auxiliary[] = [];
  private refreshes: Refresh[] = [];
  private cellTracks: CellTrack[] = [];
  constructor() {
    super();
  }

  activate(): (() => void) | void {
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
    for (const a of this.auxiliaries) {
      a.deactivate?.();
    }
  }

  refresh(updatePayload: UpdatePayload): void {
    for (const r of this.refreshes) {
      r.refresh(updatePayload);
    }
  }

  trackCell(cell: Cell): void {
    for (const v of this.cellTracks) {
      v.trackCell!(cell);
    }
  }

  untrackCell(cellTag: string): void {
    for (const v of this.cellTracks) {
      v.untrackCell!(cellTag);
    }
  }

  onAddAuxiliary?(...aux: Auxiliary[]): () => void;
  addAuxiliary(...aux: Auxiliary[]) {
    this.auxiliaries.push(...aux);
    this.onAuxiliariesChange();
    const onDeactivates = new Set<() => void>();
    const onAddDeactivate = this.onAddAuxiliary?.(...aux);
    if (onAddDeactivate) {
      onDeactivates.add(onAddDeactivate);
    }
    return () => {
      onDeactivates.forEach(d => d());
      this.removeAllAuxiliaries();
    };
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
    this.onAuxiliariesChange();
  }

  private onAuxiliariesChange() {
    this.refreshes = this.auxiliaries.filter((a): a is Refresh => !!a.refresh).sort((a, b) => (a.refreshOrder ?? 0) - (b.refreshOrder ?? 0));
    this.cellTracks = this.auxiliaries.filter((a): a is CellTrack => !!a.trackCell || !!a.untrackCell);
  }
}
