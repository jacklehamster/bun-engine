import { useEffect, useState } from "react";
import { useGameContext } from './Provider';

export enum LockStatus {
  LOCKED,
  UNLOCKED,
}

export function useControlsLock(uid?: string) {
  const context = useGameContext();
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    if (uid && locked) {
      context.addControlsLock(uid);
      return () => context.removeControlsLock(uid);
    }
  }, [context, locked, uid]);

  return {
    lock() {
      setLocked(true);
    },
    unlock() {
      setLocked(false);
    },
    inControl: context.topPopupUid === uid ? LockStatus.UNLOCKED : LockStatus.LOCKED,
  };
}
