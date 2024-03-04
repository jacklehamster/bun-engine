import { useCallback, useEffect, useMemo, useState } from 'react';
import { Popup } from '../popup/Popup';
import { useControlsLock } from '../useControlsLock';
import { useGameContext } from '../Provider';
import { ControlsListener } from 'controls/ControlsListener';
import { map } from 'abstract-list';
import { MenuData } from './model/MenuData';
import { IControls } from 'controls/IControls';
import { UserInterface } from 'ui/UserInterface';
import { useSelection } from './useSelection';
import { PopAction } from 'ui/actions/PopAction';
import { useActions } from 'ui/actions/useActions';

interface Props {
  menuData: MenuData;
  ui: UserInterface;
}

export function Menu({ menuData, ui }: Props): JSX.Element {
  const { lock, unlock, inControl } = useControlsLock(menuData.uid);
  const { controls } = useGameContext();
  const { moveSelection, selectedItem } = useSelection({ menuData });
  const { performActions } = useActions({ ui });

  const onAction = useCallback<(controls: IControls) => void>(
    (controls) => {
      if (menuData.uid !== inControl) {
        return;
      }
      const dy = (controls.forward ? -1 : 0) + (controls.backward ? 1 : 0);
      moveSelection(dy);
      if (controls.action && selectedItem?.action) {
        const actions = Array.isArray(selectedItem.action)
          ? selectedItem.action
          : [selectedItem.action];
        performActions(actions);
      }
    },
    [menuData, moveSelection, inControl, selectedItem, performActions],
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
        const color = selectedItem === item ? 'black' : 'white';
        const backgroundColor = selectedItem === item ? 'white' : 'black';
        return (
          <div key={index} style={{ color, backgroundColor }}>
            {label}
          </div>
        );
      })}
    </Popup>
  );
}
