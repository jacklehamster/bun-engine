import { List } from "abstract-list";
import { MenuItem } from '../conversation/MenuItem';
import { PopupData } from "ui/model/ui/PopupData";

export interface MenuData extends PopupData {
  type?: "menu",
  items: List<MenuItem> | MenuItem[];
}
