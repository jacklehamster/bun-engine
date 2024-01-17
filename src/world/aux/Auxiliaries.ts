import { List, forEach } from "world/sprite/List";
import { Auxiliary } from "./Auxiliary";
import { UpdatePayload } from "updates/Refresh";
import { Cell } from "world/grid/CellPos";

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
    return this.auxiliaries.at(index);
  }

  refresh(updatePayload: UpdatePayload): void {
    forEach(this.auxiliaries, aux => aux?.refresh?.(updatePayload));
  }

  trackCell(cell: Cell, updatePayload: UpdatePayload): boolean {
    let didTrack = false;
    forEach(this.auxiliaries, aux => {
      if (aux?.trackCell?.(cell, updatePayload)) {
        didTrack = true;
      }
    });
    return didTrack;
  }

  untrackCell(cellTag: string, updatePayload: UpdatePayload): void {
    forEach(this.auxiliaries, aux => aux?.untrackCell?.(cellTag, updatePayload));
  }

  activate(): void {
    if (!this.active) {
      this.active = true;
      forEach(this.auxiliaries, aux => aux?.activate?.());
    }
  }

  deactivate(): void {
    if (this.active) {
      this.active = false;
      forEach(this.auxiliaries, aux => aux?.deactivate?.());
    }
  }
}
