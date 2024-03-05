import { useCallback, useMemo, useState } from "react";
import { DialogData } from "ui/model/ui/DialogData";
import { MenuData } from "ui/model/ui/MenuData";

export type ElemData = DialogData | MenuData;

export function usePopupManager() {
  const [popups, setPopups] = useState<ElemData[]>([]);
  const topPopupUid = useMemo(
    () => popups[popups.length - 1]?.uid ?? '',
    [popups],
  );

  const addPopup = useCallback(
    (data: ElemData) => setPopups((popups) => {
      return [...popups, data];
    }),
    [setPopups],
  );

  const closePopup = useCallback(
    (uid?: string) => {
      setPopups((popups) => {
        if (!uid || uid === popups[popups.length - 1].uid) {
          return popups.slice(0, popups.length - 1);
        }
        return popups;
      });
    },
    [setPopups],
  );

  return {
    popups,
    addPopup,
    closePopup,
    topPopupUid,
  }
}
