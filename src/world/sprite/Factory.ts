import { Cell } from "cell-tracker";
import { IElemFactory } from "./aux/IElemFactory";
import { alea } from "seedrandom"
import { List } from "abstract-list";
import { Bag } from "./Bag";

interface CellFiller<B extends Bag<any>> {
  fillBag(cell: Cell, bag: B, rng: () => number): void;
}

interface Props<B extends Bag<any>> {
  filler: CellFiller<B>;
  bag: B;
}

export class Factory<T> implements IElemFactory<T> {
  readonly #bag: Bag<T>;
  readonly #filler: CellFiller<Bag<T>>;

  constructor({ filler, bag }: Props<Bag<T>>) {
    this.#filler = filler;
    this.#bag = bag;
  }

  getElemsAtCell(cell: Cell): List<T> {
    this.#filler.fillBag(cell, this.#bag, alea(cell.tag));
    return this.#bag.elems;
  }

  doneCellTracking(): void {
    this.#bag.done();
  }
}
