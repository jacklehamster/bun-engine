import { useCallback, useMemo, useState } from "react";
import { DialogData } from "ui/dialog/model/DialogData";
import { MenuData } from "ui/menu/model/MenuData";

export type ElemData = DialogData | MenuData;

export function usePopupManager() {
  const [popups, setPopups] = useState<ElemData[]>([]);
  const topPopupUid = useMemo(
    () => popups[popups.length - 1]?.uid ?? '',
    [popups],
  );

  const addPopup = useCallback(
    (data: ElemData) => setPopups((popups) => [...popups, data]),
    [setPopups],
  );

  const closePopup = useCallback(
    () => setPopups((popups) => popups.slice(0, popups.length - 1)),
    [setPopups],
  );

  return {
    popups,
    addPopup,
    closePopup,
    topPopupUid,
  }
}
