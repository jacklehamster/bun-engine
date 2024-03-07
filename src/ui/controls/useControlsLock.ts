import { useEffect, useState } from "react";
import { useGameContext } from '../context/Provider';
import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";

export enum LockStatus {
  LOCKED,
  UNLOCKED,
}

interface Props {
  uid?: string;
  onAction: (controls: IControls) => void;
}

export function useControlsLock({ uid, onAction }: Props) {
  const { controls, addControlsLock, removeControlsLock, topPopupUid } = useGameContext();
  const [locked, setLocked] = useState(false);

  const lockState = topPopupUid === uid ? LockStatus.UNLOCKED : LockStatus.LOCKED;

  useEffect((): (() => void) | void => {
    if (lockState) {
      setLocked(true);
      const listener: ControlsListener = { onAction };
      controls.addListener(listener);
      return () => {
        controls.removeListener(listener);
        setLocked(false);
      };
    }
  }, [onAction, setLocked, controls, lockState]);

  useEffect(() => {
    if (uid && locked) {
      addControlsLock(uid);
      return () => removeControlsLock(uid);
    }
  }, [addControlsLock, removeControlsLock, locked, uid]);
}
