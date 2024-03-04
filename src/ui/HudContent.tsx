import { useEffect, useMemo, useState } from 'react';
import { Provider } from './Provider';
import { PopupManager } from './popup/PopupManager';
import { GameContextType } from './GameContextType';
import { IControls } from 'controls/IControls';
import { usePopupManager } from './popup/usePopupManager';
import { PopupContainer } from './popup/PopupContainer';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  dialogManager: PopupManager;
  controls: IControls;
}

export function HudContent({ dialogManager, controls }: Props) {
  const { popups, addPopup, closePopup, topPopupUid } = usePopupManager();
  const [selection, setSelection] = useState(0);
  const [onClose, setOnClose] = useState<() => void>();

  const gameContext: GameContextType = useMemo<GameContextType>(
    () => ({
      addControlsLock: dialogManager.addControlsLock,
      removeControlsLock: dialogManager.removeControlsLock,
      openMenu: (data) => {
        const type = 'menu';
        const uid = type + '-' + uuidv4();
        addPopup({ uid, type, ...data });
      },
      openDialog: (data) => {
        const type = 'dialog';
        const uid = type + '-' + uuidv4();
        addPopup({ uid, type, ...data });
      },
      closePopup,
      controls,
      topPopupUid,
      onSelection: setSelection,
    }),
    [dialogManager, controls, addPopup, closePopup, topPopupUid, setSelection],
  );

  useEffect(() => {
    dialogManager.openMenu = async (data) => {
      gameContext.openMenu(data);
      return new Promise((resolve) => {
        setOnClose(() => resolve);
      });
    };
    dialogManager.openDialog = async (data) => {
      gameContext.openDialog(data);
      return new Promise((resolve) => {
        setOnClose(() => resolve);
      });
    };
    dialogManager.closePopup = () => {
      gameContext.closePopup();
      setOnClose((previousOnClose) => {
        previousOnClose?.();
        return undefined;
      });
    };
    dialogManager.selection = selection;
  }, [dialogManager, gameContext, selection]);

  return (
    <Provider context={gameContext}>
      <div>Title</div>
      <PopupContainer popups={popups} ui={dialogManager} />
    </Provider>
  );
}
