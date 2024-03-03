import { useCallback, useEffect, useMemo, useState } from 'react';
import { Popup } from '../popup/Popup';
import { useControlsLock } from '../useControlsLock';
import { useGameContext } from '../Provider';
import { ControlsListener } from 'controls/ControlsListener';
import { map } from 'abstract-list';
import { MenuData } from './model/MenuData';
import { IControls } from 'controls/IControls';
import { usePopup } from 'ui/popup/usePopup';

interface Props {
  menuData: MenuData;
}

export function Menu({ menuData }: Props): JSX.Element {
  const { lock, unlock, inControl } = useControlsLock(menuData.uid);
  const { controls } = useGameContext();
  const [selected, setSelected] = useState(0);

  const { popupInterface } = usePopup({ popupData: menuData });

  useEffect(() => {
    if (menuData) {
      setSelected(0);
    }
  }, [menuData]);

  const onAction = useCallback<(controls: IControls) => void>(
    (controls) => {
      if (menuData.uid !== inControl) {
        return;
      }
      const dy = (controls.forward ? -1 : 0) + (controls.backward ? 1 : 0);
      const len = menuData!.items.length.valueOf();
      setSelected((value) => (value + dy + len) % len);
      if (controls.action) {
        menuData?.items.at(selected)?.action?.(popupInterface);
      }
    },
    [menuData, selected, inControl],
  );

  useEffect((): (() => void) | void => {
    if (menuData && controls) {
      lock();
      const listener: ControlsListener = {
        onAction,
      };
      controls.addListener(listener);
      return () => {
        controls.removeListener(listener);
        unlock();
      };
    }
  }, [menuData, onAction, lock, unlock, controls]);

  const position: [number, number] = [
    menuData?.position?.[0] ?? 50,
    menuData?.position?.[1] ?? 50,
  ];
  const size: [number | undefined, number | undefined] = [
    menuData?.size?.[0],
    menuData?.size?.[1],
  ];

  return (
    <Popup
      position={position}
      size={size}
      fontSize={menuData.fontSize}
      positionFromBottom={!!menuData.positionFromBottom}
      positionFromRight={!!menuData.positionFromRight}
      zIndex={menuData.zIndex}
    >
      {map(menuData.items, (item, index) => {
        if (!item) {
          return;
        }
        const { label } = item;
        const color = selected === index ? 'black' : 'white';
        const backgroundColor = selected === index ? 'white' : 'black';
        return (
          <div key={index} style={{ color, backgroundColor }}>
            {label}
          </div>
        );
      })}
    </Popup>
  );
}
