import { useCallback, useEffect, useMemo, useState } from 'react';
import { ElemData } from './usePopupManager';
import { Dialog } from 'ui/dialog/Dialog';
import { Menu } from 'ui/menu/Menu';

interface Props {
  popups: ElemData[];
}

export function PopupContainer({ popups }: Props) {
  const [elemsMap, setElemsMap] = useState<Record<string, JSX.Element>>({});

  const createElement = useCallback<(data: ElemData) => JSX.Element>((data) => {
    switch (data.type) {
      case 'dialog':
        return <Dialog key={data.uid} dialogData={data} />;
      case 'menu':
        return <Menu key={data.uid} menuData={data} />;
    }
    throw new Error(`Invalid data type: ${data.type}`);
  }, []);

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

  const elements = useMemo<JSX.Element[]>(() => {
    return popups.map((data) => elemsMap[data.uid ?? '']);
  }, [elemsMap, popups]);

  return <>{elements}</>;
}
