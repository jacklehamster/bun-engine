import { useCallback, useEffect, useMemo, useState } from "react";
import { DialogData } from "./model/DialogData";
import { useControlsLock } from "ui/useControlsLock";
import { useGameContext } from "ui/Provider";
import { ControlsListener } from "controls/ControlsListener";
import { UserInterface } from "ui/UserInterface";
import { useActions } from "ui/actions/useActions";

interface Props {
  dialogData: DialogData;
  ui: UserInterface;
}

interface Result {
  text?: string;
}

export function useDialog({ dialogData, ui }: Props): Result {
  const { lock, unlock, inControl } = useControlsLock(dialogData.uid);
  const { controls } = useGameContext();
  const [index, setIndex] = useState(0);
  const { performActions } = useActions({ ui });

  const nextMessage = useCallback(() => setIndex(value => value + 1), [setIndex]);

  useEffect(() => ui.nextMessage = nextMessage, [nextMessage, ui]);

  useEffect(() => {
    if (dialogData && controls) {
      lock();
      const listener: ControlsListener = {
        onAction(controls) {
          if (dialogData.uid !== inControl) {
            return;
          }

          if (controls.action) {
            nextMessage();
          }
        },
      };
      controls.addListener(listener);
      return () => {
        controls.removeListener(listener);
        unlock();
      };
    }
  }, [dialogData, nextMessage, lock, unlock, controls, inControl]);

  useEffect(() => setIndex(0), [dialogData]);

  const messages = useMemo(() => dialogData.conversation.messages, [dialogData]);
  const message = useMemo(() => messages.at(index), [messages, index]);

  useEffect(() => {
    const numMessages = messages.length.valueOf();
    if (index >= numMessages) {
      ui.closePopup();
    }
  }, [index, ui, messages]);

  useEffect(() => {
    if (message?.action) {
      const actions = Array.isArray(message.action) ? message.action : [message.action];
      performActions(actions);
    }
  }, [message, performActions]);

  return {
    text: message?.text,
  };
}
