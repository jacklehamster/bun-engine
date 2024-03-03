import { useMemo } from 'react';
import { PopupInterface } from './PopupInterface';
import { useGameContext } from 'ui/Provider';
import { PopupData } from './model/PopupData';

interface Props {
  popupData?: PopupData;
  next?(): void;
}

export function usePopup({ popupData }: Props) {
  const { closePopup } = useGameContext();
  const popupInterface = useMemo<PopupInterface>(
    () => ({
      close() {
        closePopup();
      },
    }),
    [closePopup],
  );

  return { popupInterface };
}
