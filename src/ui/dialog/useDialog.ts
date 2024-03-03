import { usePopup } from "ui/popup/usePopup";
import { DialogInterface } from "./DialogInterface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DialogData } from "./model/DialogData";
import { useControlsLock } from "ui/useControlsLock";
import { useGameContext } from "ui/Provider";
import { ControlsListener } from "controls/ControlsListener";

interface Props {
  dialogData: DialogData;
}

interface Result {
  text?: string;
}

export function useDialog({ dialogData }: Props): Result {
  const { lock, unlock, inControl } = useControlsLock(dialogData.uid);
  const { controls } = useGameContext();
  const [index, setIndex] = useState(0);
  const { popupInterface } = usePopup({ popupData: dialogData });

  const nextMessage = useCallback(() => setIndex((value) => value + 1), [setIndex]);

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

  useEffect(() => {
    setIndex(0);
  }, [dialogData]);

  const messages = useMemo(() => dialogData.conversation.messages, [dialogData]);
  const message = useMemo(() => messages.at(index), [messages, index]);

  useEffect(() => {
    const numMessages = messages.length.valueOf();
    if (index >= numMessages) {
      popupInterface.close();
    }
  }, [index, popupInterface, messages]);

  const dialogInterface = useMemo<DialogInterface>(() => ({
    ...popupInterface,
    nextMessage,
  }), [popupInterface]);

  useEffect(() => {
    message?.action?.(dialogInterface);
    if (message?.next) {
      dialogInterface.nextMessage();
    }
  }, [message, dialogInterface]);

  return {
    text: message?.text,
  };
}
