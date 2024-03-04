import { IControls } from 'controls/IControls';
import { MenuData } from './menu/model/MenuData';
import { DialogData } from './dialog/model/DialogData';

export interface GameContextType {
  addControlsLock(uid: string): void;
  removeControlsLock(uid: string): void;
  openMenu(value: MenuData): void;
  openDialog(value: DialogData): void;
  closePopup(): void;
  controls?: IControls;
  topPopupUid: string;
  onSelection: (selection: number) => void;
}

export const DEFAULT_GAME_CONTEXT: GameContextType = {
  addControlsLock: function (_uid: string): void {
    throw new Error('Function not implemented.');
  },
  removeControlsLock: function (_uid: string): void {
    throw new Error('Function not implemented.');
  },
  openMenu: function (_value: MenuData): Promise<number> {
    throw new Error('Function not implemented.');
  },
  openDialog: function (_value: DialogData | undefined): Promise<void> {
    throw new Error('Function not implemented.');
  },
  closePopup(): void {
    throw new Error('Function not implemented.');
  },
  topPopupUid: '',
  onSelection(selection) {
    throw new Error('Function not implemented');
  },
};
