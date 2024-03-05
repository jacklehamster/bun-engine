import { useCallback, useEffect, useMemo, useState } from 'react';
import { ElemData } from './usePopupManager';
import { Dialog } from 'ui/dialog/Dialog';
import { Menu } from 'ui/menu/Menu';
import { UserInterface } from 'ui/UserInterface';

interface Props {
  popups: ElemData[];
  ui: UserInterface;
  onDone(): void;
}

export function PopupContainer({ popups, ui, onDone }: Props) {
  const createElement = useCallback<(data: ElemData) => JSX.Element>(
    (data) => {
      switch (data.type) {
        case 'dialog':
          return (
            <Dialog key={data.uid} dialogData={data} ui={ui} onDone={onDone} />
          );
        case 'menu':
          return (
            <Menu key={data.uid} menuData={data} ui={ui} onDone={onDone} />
          );
      }
      throw new Error(`Invalid data type: ${data.type}`);
    },
    [ui, onDone],
  );

  const elemsMap = useMemo(() => {
    const newElemsMap: Record<string, JSX.Element> = {};
    popups.forEach((data) => {
      if (data.uid) {
        newElemsMap[data.uid] = elemsMap[data.uid] ?? createElement(data);
      }
    });
    return newElemsMap;
  }, [popups, createElement]);

  const elements = useMemo<JSX.Element[]>(
    () => popups.map((data) => elemsMap[data.uid ?? '']),
    [elemsMap, popups],
  );

  return <>{elements}</>;
}
