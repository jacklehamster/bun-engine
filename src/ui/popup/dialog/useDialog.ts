import { useCallback, useEffect, useMemo, useState } from "react";
import { DialogData } from "./DialogData";
import { useControlsLock } from "../controls/useControlsLock";
import { UserInterface } from "../UserInterface";
import { useActions } from "../actions/useActions";

interface Props {
  dialogData: DialogData;
  ui: UserInterface;
  onDone(): void;
}

interface Result {
  text?: string;
}

export function useDialog({ dialogData, ui, onDone }: Props): Result {
  const [index, setIndex] = useState(0);
  const { performActions } = useActions({ ui });

  const nextMessage = useCallback(() => setIndex(value => value + 1), [setIndex]);
  useControlsLock({ uid: dialogData.uid, listener: { onAction: nextMessage } });

  useEffect(() => {
    ui.nextMessage = nextMessage;
    return () => {
      ui.nextMessage = () => { };
    };
  }, [nextMessage, ui]);

  const messages = useMemo(() => dialogData.conversation.messages, [dialogData]);
  const message = useMemo(() => messages.at(index), [messages, index]);

  useEffect(() => {
    const numMessages = messages.length.valueOf();
    if (index >= numMessages) {
      ui.closePopup(dialogData.uid);
      onDone();
    }
  }, [index, ui, messages, dialogData, onDone]);

  useEffect(() => {
    if (message?.action) {
      const actions = Array.isArray(message.action) ? message.action : [message.action];
      performActions(actions).then(nextMessage);
    }
  }, [message, performActions, dialogData, nextMessage]);

  return {
    text: message?.text,
  };
}
