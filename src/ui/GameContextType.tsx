import { IControls } from 'controls/IControls';
import { MenuData } from './menu/model/MenuData';
import { DialogData } from './dialog/model/DialogData';

export interface GameContextType {
  addControlsLock(uid: string): void;
  removeControlsLock(uid: string): void;
  openMenu(value: MenuData): void;
  openDialog(value: DialogData): void;
  popBack(): void;
  controls?: IControls;
  topPopupUid: string;
}

export const DEFAULT_GAME_CONTEXT: GameContextType = {
  addControlsLock: function (_uid: string): void {
    throw new Error('Function not implemented.');
  },
  removeControlsLock: function (_uid: string): void {
    throw new Error('Function not implemented.');
  },
  openMenu: function (_value: MenuData): void {
    throw new Error('Function not implemented.');
  },
  openDialog: function (_value: DialogData | undefined): void {
    throw new Error('Function not implemented.');
  },
  popBack(): void {
    throw new Error('Function not implemented.');
  },
  topPopupUid: '',
};
