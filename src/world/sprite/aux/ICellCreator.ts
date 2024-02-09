import { List } from "abstract-list";
import { IUpdateNotifier } from "updates/IUpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { Cell, Tag } from "world/grid/Cell";

export interface ICellCreator<T> extends IUpdateNotifier, List<T>, Auxiliary {
  createCell(cell: Cell): boolean;
  destroyCells(tags: Set<Tag>): void;
}
