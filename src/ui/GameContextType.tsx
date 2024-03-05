import { IControls } from 'controls/IControls';
import { MenuData } from './model/ui/MenuData';
import { DialogData } from './model/ui/DialogData';
import { ControlsListener } from 'controls/ControlsListener';

export interface GameContextType {
  addControlsLock(uid: string): void;
  removeControlsLock(uid: string): void;
  openMenu(value: MenuData): void;
  openDialog(value: DialogData): void;
  closePopup(): void;
  controls: IControls;
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
  controls: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    turnLeft: false,
    turnRight: false,
    action: false,
    exit: false,
    addListener: function (listener: ControlsListener): void {
      throw new Error('Function not implemented.');
    },
    removeListener: function (listener: ControlsListener): void {
      throw new Error('Function not implemented.');
    },
    enabled: false,
  },
};
