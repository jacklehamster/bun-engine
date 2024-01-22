import { Popup } from 'ui/Popup';
import { DialogData } from './model/DialogData';
import React, { useEffect, useState } from 'react';
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
    if (dialogData) {
      setIndex(0);
    }
  }, [dialogData]);

  useEffect((): (() => void) | void => {
    if (dialogData && controls) {
      lock();
      const listener: ControlsListener = {
        onAction(controls) {
          if (controls.action) {
            setIndex((value) => {
              if (value === dialogData.conversation.messages.length - 1) {
                setDialog(undefined);
                return 0;
              }
              return value + 1;
            });
          }
        },
      };
      controls.addListener(listener);
      return () => {
        controls.removeListener(listener);
        unlock();
      };
    }
  }, [dialogData, setDialog, lock, unlock, controls]);

  return (
    dialogData && (
      <Popup position={[50, 500]} size={[500, 150]}>
        <div
          style={{
            padding: 10,
          }}
        >
          {dialogData?.conversation.messages.at(index)?.text}
        </div>
      </Popup>
    )
  );
}
