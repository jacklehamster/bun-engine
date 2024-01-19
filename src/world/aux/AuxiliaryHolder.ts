import { Refresh, UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { Cell } from "world/grid/CellPos";
import { CellTrack } from "world/grid/CellTrack";
import { Holder } from "./Holder";

const EMPTY_REFRESH: Refresh[] = [];
const EMPTY_CELLTRACK: CellTrack[] = [];

export class AuxiliaryHolder<H extends Holder = any> implements Holder<AuxiliaryHolder<H>>, Auxiliary<H> {
  private auxiliaries: Auxiliary[] = [];
  private refreshes: Refresh[] = EMPTY_REFRESH;
  private cellTracks: CellTrack[] = EMPTY_CELLTRACK;
  active: boolean = false;

  activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    this.auxiliaries.forEach(aux => aux.activate?.());
  }

  deactivate() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.auxiliaries.forEach(aux => aux.deactivate?.());
  }

  refresh(updatePayload: UpdatePayload): void {
    if (!this.active) {
      return;
    }
    for (const r of this.refreshes) {
      r.refresh?.(updatePayload);
    }
  }

  trackCell(cell: Cell, payload: UpdatePayload): boolean {
    let didTrack = false;
    for (const v of this.cellTracks) {
      if (v.trackCell!(cell, payload)) {
        didTrack = true;
      }
    }
    return didTrack;
  }

  untrackCell(cellTag: string, payload: UpdatePayload): void {
    for (const v of this.cellTracks!) {
      v.untrackCell!(cellTag, payload);
    }
  }

  addAuxiliary(...aux: Auxiliary<any>[]): this {
    aux.forEach(a => {
      a.holder = this;
      this.auxiliaries.push(a);
      if (this.active) {
        a.activate?.();
      }
    });
    this.onAuxiliariesChange();
    return this;
  }

  removeAuxiliary(...aux: Auxiliary[]) {
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
    this.onAuxiliariesChange();
  }

  private onAuxiliariesChange() {
    this.refreshes = this.auxiliaries?.filter((a): a is Refresh => !!a.refresh) ?? EMPTY_REFRESH;
    this.cellTracks = this.auxiliaries?.filter((a): a is CellTrack => !!a.trackCell || !!a.untrackCell) ?? EMPTY_CELLTRACK;
  }
}
