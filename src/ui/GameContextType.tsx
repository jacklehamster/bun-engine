import { IControls } from 'controls/IControls';
import { MenuData } from './menu/model/MenuData';
import { DialogData } from './dialog/model/DialogData';

export interface GameContextType {
  addControlsLock(uid: string): void;
  removeControlsLock(uid: string): void;
  setMenu(value: MenuData | undefined): void;
  setDialog(value: DialogData | undefined): void;
  controls?: IControls;
}

export const DEFAULT_GAME_CONTEXT: GameContextType = {
  addControlsLock: function (_uid: string): void {
    throw new Error('Function not implemented.');
  },
  removeControlsLock: function (_uid: string): void {
    throw new Error('Function not implemented.');
  },
  setMenu: function (_value: MenuData): void {
    throw new Error('Function not implemented.');
  },
  setDialog: function (_value: DialogData | undefined): void {
    throw new Error('Function not implemented.');
  },
};
