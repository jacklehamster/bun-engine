import { List } from "abstract-list";
import { UpdateNotifier } from "updates/UpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { Cell, Tag } from "world/grid/Cell";

export interface ICellCreator<T> extends Partial<UpdateNotifier>, List<T>, Auxiliary {
  createCell(cell: Cell): boolean;
  destroyCells(tags: Set<Tag>): void;
}
