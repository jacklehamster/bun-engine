import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu } from './menu/Menu';
import { Provider } from './Provider';
import { PopupManager } from './popup/PopupManager';
import { GameContextType } from './GameContextType';
import { IControls } from 'controls/IControls';
import { MenuData } from './menu/model/MenuData';
import { Dialog } from './dialog/Dialog';
import { DialogData } from './dialog/model/DialogData';

type ElemData = DialogData | MenuData;

interface Props {
  dialogManager: PopupManager;
  controls: IControls;
}

export function HudContent({ dialogManager, controls }: Props) {
  const [popups, setPopups] = useState<ElemData[]>([]);
  const [elemsMap, setElemsMap] = useState<Record<string, JSX.Element>>({});
  const topPopupUid = useMemo(
    () => popups[popups.length - 1]?.uid ?? '',
    [popups],
  );

  const createElement = useCallback<(data: ElemData) => JSX.Element>((data) => {
    switch (data.type) {
      case 'dialog':
        return <Dialog key={data.uid} dialogData={data} />;
      case 'menu':
        return <Menu key={data.uid} menuData={data} />;
    }
    throw new Error(`Invalid data type: ${data.type}`);
  }, []);

  const addPopup = useCallback(
    (data: ElemData) => setPopups((popups) => [...popups, data]),
    [setPopups],
  );

  const popBack = useCallback(
    () => setPopups((popups) => popups.slice(0, popups.length - 1)),
    [setPopups],
  );

  const gameContext: GameContextType = useMemo<GameContextType>(
    () => ({
      addControlsLock: dialogManager.addPopup,
      removeControlsLock: dialogManager.removePopup,
      popMenu: addPopup,
      popDialog: addPopup,
      popBack,
      controls,
      topPopupUid,
    }),
    [dialogManager, controls, addPopup, popBack, topPopupUid],
  );

  useEffect(() => {
    dialogManager.popMenu = gameContext.popMenu;
    dialogManager.popDialog = gameContext.popDialog;
  }, [dialogManager, gameContext]);

  useEffect(() => {
    setElemsMap((elemsMap) => {
      const newElemsMap: Record<string, JSX.Element> = {};
      popups.forEach((data) => {
        if (data.uid) {
          newElemsMap[data.uid] = elemsMap[data.uid] ?? createElement(data);
        }
      });
      return newElemsMap;
    });
  }, [popups, setElemsMap, createElement]);

  const elements = useMemo<JSX.Element[]>(
    () => popups.map((data) => elemsMap[data.uid ?? '']),
    [elemsMap, popups],
  );

  return (
    <Provider context={gameContext}>
      <div>Title</div>
      {elements}
    </Provider>
  );
}
