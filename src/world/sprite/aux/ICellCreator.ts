import { Auxiliary } from "world/aux/Auxiliary";
import { ICellTracker } from "cell-tracker";
import { UpdatableList } from "../../../core/UpdatableList";

export interface ICellCreator<T> extends UpdatableList<T>, Auxiliary, ICellTracker {
}
