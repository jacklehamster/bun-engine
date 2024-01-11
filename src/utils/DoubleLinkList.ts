import { List } from "world/sprite/List";
import { FreeStack } from "./FreeStack";
import { ObjectPool } from "./ObjectPool";

interface DoubleLinkListNode<T> {
  value: T;
  prev?: DoubleLinkListNode<T>;
  next?: DoubleLinkListNode<T>;
}

export class DoubleLinkList<T> implements FreeStack<T> {
  private readonly start: DoubleLinkListNode<T>;
  private readonly end: DoubleLinkListNode<T>;
  private readonly nodeMap: Map<T, DoubleLinkListNode<T>> = new Map();
  private readonly pool: ObjectPool<DoubleLinkListNode<T>, T>;

  constructor(edgeValue: T) {
    this.start = { value: edgeValue };
    this.end = { value: edgeValue };
    this.start.next = this.end;
    this.end.prev = this.start;
    this.pool = new ObjectPool<DoubleLinkListNode<T>, T>((value: T, elem) => {
      if (!elem) {
        return { value };
      }
      elem.value = value;
      return elem;
    });
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
    const formerTop = this.end.prev!;
    const newTop: DoubleLinkListNode<T> = this.pool.create(value);
    newTop.prev = formerTop;
    newTop.next = this.end;

    formerTop.next = this.end.prev = newTop;
    this.nodeMap.set(value, newTop);
  }

  remove(value: T): boolean {
    const entry = this.nodeMap.get(value);
    if (entry) {
      //  remove
      if (entry.prev) {
        entry.prev.next = entry.next;
      }
      if (entry.next) {
        entry.next.prev = entry.prev;
      }
      entry.prev = entry.next = undefined;
      this.pool.recycle(entry);
      return true;
    } else {
      return false;
    }
  }

  popBottom(): T | undefined {
    const entryToRemove = this.start.next!;
    if (entryToRemove !== this.end) {
      const newBottom = entryToRemove.next!;
      this.start.next = newBottom;
      newBottom.prev = this.start;
      this.nodeMap.delete(entryToRemove.value);
      entryToRemove.prev = entryToRemove.next = undefined;
      this.pool.recycle(entryToRemove);
      return entryToRemove.value;
    }
    return;
  }
}
