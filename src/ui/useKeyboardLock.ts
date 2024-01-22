import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useGameContext } from './Provider';

export function useControlsLock() {
  const context = useGameContext();
  const [locked, setLocked] = useState(false);
  useEffect((): (() => void) | void => {
    if (locked) {
      const uid = uuidv4();
      context.addControlsLock(uid);
      return () => {
        context.removeControlsLock(uid);
      };
    }
  }, [context, locked]);

  return {
    lock() {
      setLocked(true);
    },
    unlock() {
      setLocked(false);
    }
  }
}
