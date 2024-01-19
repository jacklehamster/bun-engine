import { Auxiliary } from "./Auxiliary";
import { Cell } from "world/grid/CellPos";
import { CellTrack } from "world/grid/CellTrack";
import { Holder } from "./Holder";
import { IAuxiliaryHolder } from "./IAuxiliaryHolder";

const EMPTY_CELLTRACK: CellTrack[] = [];

export class AuxiliaryHolder<H extends Holder = any> implements IAuxiliaryHolder<H> {
  private auxiliaries: Auxiliary[] = [];
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

  trackCell(cell: Cell): boolean {
    let didTrack = false;
    for (const v of this.cellTracks) {
      if (v.trackCell!(cell)) {
        didTrack = true;
      }
    }
    return didTrack;
  }

  untrackCell(cellTag: string): void {
    for (const v of this.cellTracks!) {
      v.untrackCell!(cellTag);
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
    this.cellTracks = this.auxiliaries?.filter((a): a is CellTrack => !!a.trackCell || !!a.untrackCell) ?? EMPTY_CELLTRACK;
  }
}
