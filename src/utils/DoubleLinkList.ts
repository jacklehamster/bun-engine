import { FreeStack } from "./FreeStack";
import { ItemPool, ObjectPool } from "bun-pool";

export class DoubleLinkList<T> implements FreeStack<T> {
  readonly #start: DoubleLinkListNode<T>;
  readonly #end: DoubleLinkListNode<T>;
  readonly #nodeMap: Map<T, DoubleLinkListNode<T>> = new Map();

  constructor(edgeValue: T, private readonly pool: ItemPool<DoubleLinkListNode<T>, [T]> = new NodePool<T>()) {
    this.#start = { value: edgeValue };
    this.#end = { value: edgeValue };
    this.#start.next = this.#end;
    this.#end.prev = this.#start;
  }

  clear(): void {
    while (this.#deleteEntry(this.#start.next!)) {
    }
  }

  get size(): number {
    return this.#nodeMap.size;
  }

  contains(value: T): boolean {
    return this.#nodeMap.has(value);
  }

  pushTop(value: T): void {
    this.#insertEntryToTop(this.#createEntry(value));
  }

  pushBottom(value: T): void {
    this.#insertEntryToBottom(this.#createEntry(value));
  }

  moveToTop(value: T): boolean {
    const entry = this.#nodeMap.get(value);
    if (entry) {
      this.#removeEntry(entry);
      this.#insertEntryToTop(entry);
      return true;
    }
    return false;
  }

  moveToBottom(value: T): boolean {
    const entry = this.#nodeMap.get(value);
    if (entry) {
      this.#removeEntry(entry);
      this.#insertEntryToBottom(entry);
      return true;
    }
    return false;
  }

  popBottom(): T | undefined {
    return this.#deleteEntry(this.#start.next!);
  }

  popTop(): T | undefined {
    return this.#deleteEntry(this.#end.next!);
  }

  #removeEntry(entry: DoubleLinkListNode<T>): boolean {
    if (entry === this.#end || entry === this.#start) {
      return false;
    }
    if (entry.prev && entry.next) {
      entry.prev.next = entry.next;
      entry.next.prev = entry.prev;
    }
    entry.prev = entry.next = undefined;
    return true;
  }

  #createEntry(value: T): DoubleLinkListNode<T> {
    const entry: DoubleLinkListNode<T> = this.pool.create(value);
    this.#nodeMap.set(value, entry);
    return entry;
  }

  #deleteEntry(entry: DoubleLinkListNode<T>): T | undefined {
    if (!this.#removeEntry(entry)) {
      return;
    }
    this.pool.recycle(entry);
    this.#nodeMap.delete(entry.value);
    return entry.value;
  }

  #insertEntryToTop(entry: DoubleLinkListNode<T>): void {
    const formerTop = this.#end.prev!;
    const newTop: DoubleLinkListNode<T> = entry;
    newTop.prev = formerTop;
    newTop.next = this.#end;
    formerTop.next = this.#end.prev = newTop;
  }

  #insertEntryToBottom(entry: DoubleLinkListNode<T>): void {
    const formerBottom = this.#start.next!;
    const newBottom: DoubleLinkListNode<T> = entry;
    newBottom.next = formerBottom;
    newBottom.prev = this.#start;
    formerBottom.prev = this.#start.next = newBottom;
  }
}

interface DoubleLinkListNode<T> {
  value: T;
  prev?: DoubleLinkListNode<T>;
  next?: DoubleLinkListNode<T>;
}

class NodePool<T> extends ObjectPool<DoubleLinkListNode<T>, [T]> {
  constructor() {
    super((elem, value: T) => {
      if (!elem) {
        return { value };
      }
      elem.value = value;
      elem.prev = undefined;
      elem.next = undefined;
      return elem;
    });
  }
}
