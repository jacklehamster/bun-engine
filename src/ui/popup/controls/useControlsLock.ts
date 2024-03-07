import { useEffect, useState } from "react";
import { useGameContext } from '../context/Provider';
import { PopupControlListener } from "../actions/PopupControlListener";

export enum LockStatus {
  LOCKED,
  UNLOCKED,
}

interface Props {
  uid?: string;
  listener: PopupControlListener;
}

export function useControlsLock({ uid, listener }: Props) {
  const { popupControl, addControlsLock, removeControlsLock, topPopupUid } = useGameContext();
  const [locked, setLocked] = useState(false);

  const lockState = topPopupUid === uid ? LockStatus.UNLOCKED : LockStatus.LOCKED;

  useEffect((): (() => void) | void => {
    if (lockState) {
      setLocked(true);
      popupControl.addListener(listener);
      return () => {
        popupControl.removeListener(listener);
        setLocked(false);
      };
    }
  }, [listener, setLocked, popupControl, lockState]);

  useEffect(() => {
    if (uid && locked) {
      addControlsLock(uid);
      return () => removeControlsLock(uid);
    }
  }, [addControlsLock, removeControlsLock, locked, uid]);
}
