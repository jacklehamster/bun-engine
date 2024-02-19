import { useEffect, useMemo, useState } from 'react';
import { Menu } from './menu/Menu';
import { Provider } from './Provider';
import { PopupManager } from './PopupManager';
import { GameContextType } from './GameContextType';
import { IControls } from 'controls/IControls';
import { MenuData } from './menu/model/MenuData';
import { Dialog } from './dialog/Dialog';
import { DialogData } from './dialog/model/DialogData';

interface Props {
  dialogManager: PopupManager;
  controls: IControls;
}

export function HudContent({ dialogManager, controls }: Props) {
  const [menu, setMenu] = useState<MenuData>();
  const [dialog, setDialog] = useState<DialogData>();
  const [onClose, setOnClose] = useState<() => void>();

  const gameContext: GameContextType = useMemo<GameContextType>(
    () => ({
      addControlsLock: dialogManager.showPopup,
      removeControlsLock: dialogManager.dismiss,
      isMenuVisible: !!menu,
      setMenu,
      isDialogVisible: !!dialog,
      setDialog,
      controls,
    }),
    [setMenu, menu, dialogManager, controls],
  );

  useEffect(() => {
    dialogManager.showMenu = (menu: MenuData) => gameContext.setMenu(menu);
    dialogManager.dismissMenu = () => gameContext.setMenu(undefined);
    dialogManager.showDialog = (dialog: DialogData, onClose?: () => void) => {
      gameContext.setDialog(dialog);
      setOnClose(() => onClose);
    };
    dialogManager.dismissDialog = () => {
      gameContext.setDialog(undefined);
    };
  }, [dialogManager, gameContext, setOnClose]);

  useEffect(() => {
    if (!dialog) {
      onClose?.();
    }
  }, [dialog]);

  return (
    <Provider context={gameContext}>
      <div>Title</div>
      <Menu menuData={menu}></Menu>
      <Dialog dialogData={dialog}></Dialog>
    </Provider>
  );
}
