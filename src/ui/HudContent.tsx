import { useEffect, useMemo } from 'react';
import { Provider } from './Provider';
import { PopupManager } from './popup/PopupManager';
import { GameContextType } from './GameContextType';
import { IControls } from 'controls/IControls';
import { usePopupManager } from './popup/usePopupManager';
import { PopupContainer } from './popup/PopupContainer';

interface Props {
  dialogManager: PopupManager;
  controls: IControls;
}

export function HudContent({ dialogManager, controls }: Props) {
  const { popups, addPopup, popBack, topPopupUid } = usePopupManager();

  const gameContext: GameContextType = useMemo<GameContextType>(
    () => ({
      addControlsLock: dialogManager.addControlsLock,
      removeControlsLock: dialogManager.removeControlsLock,
      openMenu: addPopup,
      openDialog: addPopup,
      popBack,
      controls,
      topPopupUid,
    }),
    [dialogManager, controls, addPopup, popBack, topPopupUid],
  );

  useEffect(() => {
    dialogManager.openMenu = gameContext.openMenu;
    dialogManager.openDialog = gameContext.openDialog;
  }, [dialogManager, gameContext]);

  return (
    <Provider context={gameContext}>
      <div>Title</div>
      <PopupContainer popups={popups} />
    </Provider>
  );
}
