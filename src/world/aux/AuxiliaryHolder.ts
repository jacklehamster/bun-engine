import { Auxiliary } from "./Auxiliary";
import { Cell } from "world/grid/Cell";
import { ICellTracker } from "world/grid/ICellTracker";
import { Holder } from "./Holder";
import { IAuxiliaryHolder } from "./IAuxiliaryHolder";

const EMPTY_CELLTRACK: ICellTracker[] = [];

export class AuxiliaryHolder<H extends Holder = any> implements IAuxiliaryHolder<H> {
  private auxiliaries: Auxiliary[] = [];
  private cellTracks: ICellTracker[] = EMPTY_CELLTRACK;
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

  untrackCells(cellTags: Set<string>): void {
    for (const v of this.cellTracks!) {
      v.untrackCells!(cellTags);
    }
  }

  addAuxiliary(aux: Auxiliary<any>): this {
    aux.holder = this;
    this.auxiliaries.push(aux);
    if (this.active) {
      aux.activate?.();
    }
    this.onAuxiliariesChange();
    return this;
  }

  removeAuxiliary(aux: Auxiliary<any>) {
    let j = 0;
    for (let i = 0; i < this.auxiliaries.length; i++) {
      const a = this.auxiliaries[i];
      if (a !== aux) {
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
    this.cellTracks = this.auxiliaries?.filter((a): a is ICellTracker => !!a.trackCell || !!a.untrackCells) ?? EMPTY_CELLTRACK;
  }
}
