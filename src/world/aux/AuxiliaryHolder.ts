import { Refresh, UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { Cell } from "world/grid/CellPos";
import { CellTrack } from "world/grid/CellTrack";
import { Holder } from "./Holder";

export class AuxiliaryHolder<H extends Holder = any> implements Holder<AuxiliaryHolder<H>>, Auxiliary<H> {
  private auxiliaries?: Auxiliary[] = [];
  private refreshes?: Refresh[] = [];
  private cellTracks?: CellTrack[] = [];
  active: boolean = false;

  activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    if (this.auxiliaries) {
      for (const a of this.auxiliaries) {
        a.activate?.();
      }
    }
  }

  deactivate() {
    if (!this.active) {
      return;
    }
    this.active = false;
    if (this.auxiliaries) {
      for (const a of this.auxiliaries) {
        a.deactivate?.();
      }
      this.removeAllAuxiliaries();
    }
  }

  refresh(updatePayload: UpdatePayload): void {
    for (const r of this.refreshes!) {
      r.refresh?.(updatePayload);
    }
  }

  trackCell(cell: Cell): void {
    for (const v of this.cellTracks!) {
      v.trackCell!(cell);
    }
  }

  untrackCell(cellTag: string): void {
    for (const v of this.cellTracks!) {
      v.untrackCell!(cellTag);
    }
  }

  addAuxiliary(...aux: Auxiliary<any>[]) {
    if (!this.auxiliaries) {
      this.auxiliaries = [];
    }
    aux.forEach(a => {
      a.holder = this;
      this.auxiliaries?.push(a);
      if (this.active) {
        a.activate?.();
      }
    });
    this.onAuxiliariesChange();
  }

  removeAllAuxiliaries() {
    this.removeAuxiliary(...(this.auxiliaries ?? []));
  }

  removeAuxiliary(...aux: Auxiliary[]) {
    if (this.auxiliaries) {
      const removeSet = new Set(aux);
      let j = 0;
      for (let i = 0; i < this.auxiliaries.length; i++) {
        const a = this.auxiliaries[i];
        if (!removeSet.has(a)) {
          this.auxiliaries[j] = a;
          j++;
        } else {
          a.deactivate?.();
          a.holder = undefined;
        }
      }
      this.auxiliaries.length = j;
      if (!this.auxiliaries.length) {
        this.auxiliaries = undefined;
      }
    }
    this.onAuxiliariesChange();
  }

  private onAuxiliariesChange() {
    this.refreshes = this.auxiliaries?.filter((a): a is Refresh => !!a.refresh) ?? undefined;
    this.cellTracks = this.auxiliaries?.filter((a): a is CellTrack => !!a.trackCell || !!a.untrackCell) ?? undefined;
  }
}
