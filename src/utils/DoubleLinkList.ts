import { List } from "world/sprite/List";
import { FreeStack } from "./FreeStack";
import { ObjectPool } from "./ObjectPool";

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

export class DoubleLinkList<T extends string | number | symbol> implements FreeStack<T> {
  private readonly start: DoubleLinkListNode<T>;
  private readonly end: DoubleLinkListNode<T>;
  private readonly nodeMap: Map<T, DoubleLinkListNode<T>> = new Map();
  private readonly pool = new NodePool<T>();

  constructor(edgeValue: T) {
    this.start = { value: edgeValue };
    this.end = { value: edgeValue };
    this.start.next = this.end;
    this.end.prev = this.start;
  }

  clear(): void {
    while (this.removeEntry(this.start.next!)) {
    }
  }

  get size(): number {
    return this.nodeMap.size;
  }

  private tags: T[] = [];
  getList(): List<T> {
    this.tags.length = 0;
    for (let e = this.start.next; e !== this.end; e = e!.next) {
      this.tags.push(e!.value);
    }
    return this.tags;
  }

  pushTop(value: T): void {
    // const formerTop = this.end.prev!;
    const newTop: DoubleLinkListNode<T> = this.pool.create(value);
    this.nodeMap.set(value, newTop);
    this.moveTop(value);
  }

  contains(value: T): boolean {
    return this.nodeMap.has(value);
  }

  moveTop(value: T): boolean {
    const entry = this.nodeMap.get(value);
    if (entry) {
      //  remove entry
      if (entry.prev && entry.next) {
        entry.prev.next = entry.next;
        entry.next.prev = entry.prev;
      }

      //  re-insert at top
      const formerTop = this.end.prev!;
      const newTop: DoubleLinkListNode<T> = entry;
      newTop.prev = formerTop;
      newTop.next = this.end;
      formerTop.next = this.end.prev = newTop;
      return true;
    }
    return false;
  }

  remove(value: T): boolean {
    const entry = this.nodeMap.get(value);
    if (entry) {
      this.removeEntry(entry);
      return true;
    } else {
      return false;
    }
  }

  private removeEntry(entry: DoubleLinkListNode<T>): boolean {
    if (entry === this.end || entry === this.start) {
      return false;
    }
    entry.prev!.next = entry.next;
    entry.next!.prev = entry.prev;
    entry.prev = entry.next = undefined;
    this.pool.recycle(entry);
    this.nodeMap.delete(entry.value);
    return true;
  }

  popBottom(): T | undefined {
    const entryToRemove = this.start.next!;
    if (entryToRemove !== this.end) {
      this.removeEntry(entryToRemove);
      return entryToRemove.value;
    }
    return;
  }
}
