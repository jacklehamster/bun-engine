import { PopAction } from 'ui/actions/PopAction';

export interface MenuItem {
  label: string;
  action?: PopAction | (PopAction | undefined)[];
}
