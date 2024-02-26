import { Popup } from 'ui/Popup';
import { DialogData } from './model/DialogData';
import React, { useCallback, useEffect, useState } from 'react';
import { useControlsLock as useControlsLock } from 'ui/useKeyboardLock';
import { useGameContext } from 'ui/Provider';
import { ControlsListener } from 'controls/ControlsListener';

interface Props {
  dialogData?: DialogData;
}

export function Dialog({ dialogData }: Props) {
  const { lock, unlock } = useControlsLock();
  const [index, setIndex] = useState(0);
  const { setDialog, controls } = useGameContext();
  useEffect(() => {
    if (
      dialogData &&
      index >= dialogData.conversation.messages.length.valueOf()
    ) {
      setDialog(undefined);
    }
  }, [index, dialogData]);

  const nextMessage = useCallback(() => {
    if (dialogData) {
      setIndex((value) => {
        return value + 1;
      });
    }
  }, [dialogData, setIndex]);

  useEffect(() => {
    setIndex(0);
  }, [dialogData]);

  useEffect((): (() => void) | void => {
    if (dialogData && controls) {
      lock();
      const listener: ControlsListener = {
        onAction(controls) {
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
  }, [dialogData, nextMessage, lock, unlock, controls]);

  useEffect(() => {
    const message = dialogData?.conversation.messages.at(index);
    message?.action?.();
    if (message?.next) {
      nextMessage();
    }
  }, [index, dialogData, nextMessage]);

  const text = dialogData?.conversation.messages.at(index)?.text;
  return (
    dialogData && (
      <Popup position={[50, 500]} size={[500, 150]}>
        {text && (
          <div
            style={{
              padding: 10,
            }}
          >
            {text}
          </div>
        )}
      </Popup>
    )
  );
}
