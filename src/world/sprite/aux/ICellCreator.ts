import { Auxiliary } from "world/aux/Auxiliary";
import { ICellTracker } from "cell-tracker";
import { IUpdatableList } from "list-accumulator";

export interface ICellCreator<T> extends IUpdatableList<T>, Auxiliary, ICellTracker {
}
