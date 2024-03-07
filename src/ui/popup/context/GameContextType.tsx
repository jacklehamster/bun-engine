import { MenuData } from '../menu/MenuData';
import { DialogData } from '../dialog/DialogData';
import { PopupControl } from '../actions/PopupControl';

export interface GameContextType {
  addControlsLock(uid: string): void;
  removeControlsLock(uid: string): void;
  openMenu(value: MenuData): void;
  openDialog(value: DialogData): void;
  closePopup(): void;
  popupControl: PopupControl;
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
  popupControl: new PopupControl(),
};
