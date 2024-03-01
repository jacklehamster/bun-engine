import { List, forEach } from "abstract-list";
import { Auxiliary } from "./Auxiliary";

export class Auxiliaries implements List<Auxiliary>, Auxiliary {
  constructor(private auxiliaries: List<Auxiliary>) {
  }

  static from(...aux: Auxiliary[]) {
    return new Auxiliaries(aux);
  }

  get length(): List<Auxiliary>["length"] {
    return this.auxiliaries.length;
  }

  at(index: number): Auxiliary | undefined {
    return this.auxiliaries.at(index);
  }

  activate(): void {
    forEach(this.auxiliaries, aux => aux?.activate?.());
  }

  deactivate(): void {
    forEach(this.auxiliaries, aux => aux?.deactivate?.());
  }
}
