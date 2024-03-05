import { PopAction } from 'ui/actions/PopAction';

export enum MenuItemBehavior {
  NONE,
  CLOSE_ON_SELECT,
  CLOSE_AFTER_SELECT,
}

export interface MenuItem {
  label: string;
  action?: PopAction | (PopAction | undefined)[];
  behavior?: MenuItemBehavior;
}
