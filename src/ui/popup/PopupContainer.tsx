import { useCallback, useEffect, useMemo, useState } from 'react';
import { ElemData } from './usePopupManager';
import { Dialog } from 'ui/dialog/Dialog';
import { Menu } from 'ui/menu/Menu';
import { UserInterface } from 'ui/UserInterface';

interface Props {
  popups: ElemData[];
  ui: UserInterface;
}

export function PopupContainer({ popups, ui }: Props) {
  const [elemsMap, setElemsMap] = useState<Record<string, JSX.Element>>({});

  const createElement = useCallback<
    (data: ElemData, ui: UserInterface) => JSX.Element
  >(
    (data) => {
      switch (data.type) {
        case 'dialog':
          return <Dialog key={data.uid} dialogData={data} ui={ui} />;
        case 'menu':
          return <Menu key={data.uid} menuData={data} ui={ui} />;
      }
      throw new Error(`Invalid data type: ${data.type}`);
    },
    [ui],
  );

  useEffect(() => {
    setElemsMap((elemsMap) => {
      const newElemsMap: Record<string, JSX.Element> = {};
      popups.forEach((data) => {
        if (data.uid) {
          newElemsMap[data.uid] = elemsMap[data.uid] ?? createElement(data, ui);
        }
      });
      return newElemsMap;
    });
  }, [popups, setElemsMap, createElement]);

  const elements = useMemo<JSX.Element[]>(
    () => popups.map((data) => elemsMap[data.uid ?? '']),
    [elemsMap, popups],
  );

  return <>{elements}</>;
}
