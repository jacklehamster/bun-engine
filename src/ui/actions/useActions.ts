import { useCallback } from "react";
import { UserInterface } from "ui/UserInterface";
import { PopAction } from "ui/actions/PopAction";

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
