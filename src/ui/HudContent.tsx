import { useCallback, useEffect, useMemo, useState } from 'react';
import { Provider } from './Provider';
import { PopupManager } from './popup/PopupManager';
import { GameContextType } from './GameContextType';
import { IControls } from 'controls/IControls';
import { usePopupManager } from './popup/usePopupManager';
import { PopupContainer } from './popup/PopupContainer';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  popupManager: PopupManager;
  controls: IControls;
}

export function HudContent({ popupManager, controls }: Props) {
  const { popups, addPopup, closePopup, topPopupUid } = usePopupManager();
  const [selection, setSelection] = useState(0);
  const [, setOnDones] = useState<(() => void)[]>([]);

  const gameContext: GameContextType = useMemo<GameContextType>(
    () => ({
      addControlsLock: (uid) => popupManager.addControlsLock(uid),
      removeControlsLock: (uid) => popupManager.removeControlsLock(uid),
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
    [popupManager, controls, addPopup, closePopup, topPopupUid, setSelection],
  );

  useEffect(() => {
    popupManager.openMenu = async (data) => {
      gameContext.openMenu(data);
      return new Promise((resolve) => {
        setOnDones((onDones) => [...onDones, resolve]);
      });
    };
    popupManager.openDialog = async (data) => {
      gameContext.openDialog(data);
      return new Promise((resolve) => {
        setOnDones((onDones) => [...onDones, resolve]);
      });
    };
    popupManager.closePopup = gameContext.closePopup;
    popupManager.selection = selection;
  }, [popupManager, gameContext, selection]);

  const onDone = useCallback(() => {
    setOnDones((previousOnDones) => {
      const last = previousOnDones[previousOnDones.length - 1];
      last?.();
      return previousOnDones.slice(0, previousOnDones.length - 1);
    });
  }, [setOnDones]);

  return (
    <Provider context={gameContext}>
      <div>Title</div>
      <PopupContainer popups={popups} ui={popupManager} onDone={onDone} />
    </Provider>
  );
}
