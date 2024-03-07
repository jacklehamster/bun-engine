import { useCallback } from "react";
import { UserInterface } from "../UserInterface";
import { PopAction } from "./PopAction";

interface Props {
  ui: UserInterface;
}

export function useActions({ ui }: Props) {
  const performActions = useCallback(async (actions: (PopAction | undefined)[]) => {
    for (let i = 0; i < actions.length; i++) {
      await actions[i]?.(ui);
    }
  }, [ui]);
  return { performActions };
}
