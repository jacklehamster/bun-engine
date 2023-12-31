import { List, forEach, map } from "world/sprite/List";
import { Auxiliary } from "./Auxiliary";
import { UpdatePayload } from "updates/Refresh";

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

  refresh?(updatePayload: UpdatePayload): void {
    forEach(this.auxiliaries, aux => aux.refresh?.(updatePayload));
  }

  activate?(): void | (() => void) {
    if (!this.active) {
      this.active = true;
      const onDeactivates = map(this.auxiliaries, aux => aux.activate?.());
      return () => onDeactivates.forEach(d => d?.());
    }
  }

  deactivate?(): void {
    if (this.active) {
      this.active = false;
      forEach(this.auxiliaries, aux => aux.deactivate?.());
    }
  }
}
