import { useCallback, useEffect, useMemo, useState } from "react";
import { DialogData } from "../model/ui/DialogData";
import { useControlsLock } from "ui/controls/useControlsLock";
import { UserInterface } from "ui/UserInterface";
import { useActions } from "ui/actions/useActions";
import { IControls } from "controls/IControls";

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

  const onAction = useCallback<(controls: IControls) => void>(
    (controls) => {
      if (controls.action) {
        nextMessage();
      }
    },
    [performActions, dialogData],
  );

  useControlsLock({ uid: dialogData.uid, onAction });

  const nextMessage = useCallback(() => setIndex(value => value + 1), [setIndex]);

  useEffect(() => ui.nextMessage = nextMessage, [nextMessage, ui]);

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
      performActions(actions).then(() => {
        nextMessage();
      });
    }
  }, [message, performActions, dialogData, nextMessage]);

  return {
    text: message?.text,
  };
}
