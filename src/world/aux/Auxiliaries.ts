import { List, forEach } from "world/sprite/List";
import { Auxiliary } from "./Auxiliary";
import { Cell } from "world/grid/Cell";

export class Auxiliaries implements List<Auxiliary>, Auxiliary {
  private active: boolean = false;
  constructor(private auxiliaries: List<Auxiliary>) {
  }

  static from(...aux: Auxiliary[]) {
    return new Auxiliaries(aux);
  }

  get length(): number {
    return this.auxiliaries.length;
  }

  at(index: number): Auxiliary | undefined {
    if (!this.active) {
      return undefined;
    }
    return this.auxiliaries.at(index);
  }

  trackCell(cell: Cell): boolean {
    if (!this.active) {
      return false;
    }
    let didTrack = false;
    forEach(this.auxiliaries, aux => {
      if (aux?.trackCell?.(cell)) {
        didTrack = true;
      }
    });
    return didTrack;
  }

  untrackCell(cellTag: string): void {
    if (!this.active) {
      return;
    }
    forEach(this.auxiliaries, aux => aux?.untrackCell?.(cellTag));
  }

  activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    forEach(this.auxiliaries, aux => aux?.activate?.());
  }

  deactivate(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    forEach(this.auxiliaries, aux => aux?.deactivate?.());
  }
}
