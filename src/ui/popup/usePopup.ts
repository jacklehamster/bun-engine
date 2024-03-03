import { useMemo } from 'react';
import { PopupInterface } from './PopupInterface';
import { useGameContext } from 'ui/Provider';
import { PopupData } from './model/PopupData';

interface Props {
  popupData?: PopupData;
  next?(): void;
}

export function usePopup({ popupData }: Props) {
  const { popBack } = useGameContext();
  const popupInterface = useMemo<PopupInterface>(
    () => ({
      close() {
        popBack();
      },
    }),
    [popBack],
  );

  return { popupInterface };
}
