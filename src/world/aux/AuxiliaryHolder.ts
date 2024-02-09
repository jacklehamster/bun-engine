import { Auxiliary } from "./Auxiliary";
import { Cell } from "world/grid/Cell";
import { ICellTracker } from "world/grid/ICellTracker";

const EMPTY_CELLTRACK: ICellTracker[] = [];

export class AuxiliaryHolder implements Auxiliary {
  private auxiliaries: Auxiliary[] = [];
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

  addAuxiliary(aux: Auxiliary): this {
    this.auxiliaries.push(aux);
    if (this.active) {
      aux.activate?.();
    }
    return this;
  }

  removeAuxiliary(aux: Auxiliary) {
    let j = 0;
    for (let i = 0; i < this.auxiliaries.length; i++) {
      const a = this.auxiliaries[i];
      if (a !== aux) {
        this.auxiliaries[j] = a;
        j++;
      } else {
        a.deactivate?.();
      }
    }
    this.auxiliaries.length = j;
  }
}
