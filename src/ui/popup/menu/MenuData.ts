import { List } from "abstract-list";
import { MenuItem } from './MenuItem';
import { PopupData } from "ui/popup/base/PopupData";

export interface MenuData extends PopupData {
  type?: "menu",
  items: List<MenuItem> | MenuItem[];
}
