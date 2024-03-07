import { PopAction } from '../actions/PopAction';
import { MenuItemBehavior } from './MenuItemBehavior';

export interface MenuItem {
  label: string;
  action?: PopAction | (PopAction | undefined)[];
  behavior?: MenuItemBehavior;
}
