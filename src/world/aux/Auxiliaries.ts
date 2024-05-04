import { List, forEach } from "abstract-list";
import { Active } from "dok-types";

export class Auxiliaries implements List<Active>, Active {
  #active: boolean = false;

  constructor(private auxiliaries: Active[] = []) {
  }

  static from(...aux: Active[]) {
    return new Auxiliaries(aux);
  }

  get length(): List<Active>["length"] {
    return this.auxiliaries.length;
  }

  at(index: number): Active | undefined {
    return this.auxiliaries.at(index);
  }

  activate(): void {
    if (this.#active) {
      return;
    }
    this.#active = true;
    forEach(this.auxiliaries, aux => aux?.activate?.());
  }

  deactivate(): void {
    if (!this.#active) {
      return;
    }
    this.#active = false;
    forEach(this.auxiliaries, aux => aux?.deactivate?.());
  }

  addAuxiliary(aux: Active): this {
    this.auxiliaries.push(aux);
    if (this.#active) {
      aux.activate?.();
    }
    return this;
  }

  removeAuxiliary(aux: Active) {
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
