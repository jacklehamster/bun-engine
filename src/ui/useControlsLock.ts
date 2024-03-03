import { useEffect, useState } from "react";
import { useGameContext } from './Provider';

export function useControlsLock(uid?: string) {
  const context = useGameContext();
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    if (uid) {
      if (locked) {
        context.addControlsLock(uid);
        return () => context.removeControlsLock(uid);
      }
    }
  }, [context, locked, uid]);

  return {
    lock() {
      setLocked(true);
    },
    unlock() {
      setLocked(false);
    },
    inControl: context.topPopupUid,
  };
}
