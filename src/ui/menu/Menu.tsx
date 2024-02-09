import React, { useEffect, useState } from 'react';
import { Popup } from '../Popup';
import { useControlsLock } from '../useKeyboardLock';
import { useGameContext } from '../Provider';
import { ControlsListener } from 'controls/ControlsListener';
import { map } from 'abstract-list';
import { MenuData } from './model/MenuData';

interface Props {
  menuData?: MenuData;
}

export function Menu({ menuData }: Props) {
  const { lock, unlock } = useControlsLock();
  const { setMenu, controls } = useGameContext();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (menuData) {
      setSelected(0);
    }
  }, [menuData]);

  useEffect((): (() => void) | void => {
    if (menuData && controls) {
      lock();
      const listener: ControlsListener = {
        onAction(controls) {
          const dy = (controls.forward ? -1 : 0) + (controls.backward ? 1 : 0);
          setSelected(
            (value) =>
              (value + dy + menuData.items.length) % menuData.items.length,
          );
          if (controls.exit) {
            setMenu(undefined);
          }
        },
      };
      controls.addListener(listener);
      return () => {
        controls.removeListener(listener);
        unlock();
      };
    }
  }, [menuData, setMenu, lock, unlock, controls]);

  return (
    menuData && (
      <Popup position={[50, 50]} size={[200, 200]}>
        {map(menuData.items, (item, index) => {
          if (!item) {
            return;
          }
          const { label } = item;
          return (
            <div
              key={index}
              style={{
                color: selected === index ? 'black' : 'white',
                backgroundColor: selected === index ? 'white' : 'black',
              }}
            >
              {label}
            </div>
          );
        })}
      </Popup>
    )
  );
}
