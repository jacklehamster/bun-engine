import { PopupInterface } from '../../popup/PopupInterface';

export interface MenuItem {
  label: string;
  action?: (ui: PopupInterface) => void;
}
