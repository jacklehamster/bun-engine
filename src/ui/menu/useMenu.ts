import { UserInterface } from "ui/UserInterface";
import { MenuData } from "../model/ui/MenuData";
import { LockStatus, useControlsLock } from "ui/useControlsLock";
import { useGameContext } from "ui/Provider";
import { useSelection } from "./useSelection";
import { useActions } from "ui/actions/useActions";
import { useCallback, useEffect } from "react";
import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";
import { MenuItem, MenuItemBehavior } from "../model/conversation/MenuItem";

interface Props {
  menuData: MenuData;
  ui: UserInterface;
  onDone(): void;
}

interface Result {
  selectedItem?: MenuItem;
}

export function useMenu({ menuData, ui, onDone }: Props): Result {
  const { lock, unlock, inControl } = useControlsLock(menuData.uid);
  const { controls } = useGameContext();
  const { moveSelection, selectedItem } = useSelection({ menuData });
  const { performActions } = useActions({ ui });

  const onAction = useCallback<(controls: IControls) => void>(
    async (controls) => {
      const dy = (controls.forward ? -1 : 0) + (controls.backward ? 1 : 0);
      moveSelection(dy);
      if (controls.action) {
        const behavior = selectedItem?.behavior ?? MenuItemBehavior.CLOSE_ON_SELECT;
        if (behavior === MenuItemBehavior.CLOSE_ON_SELECT) {
          ui.closePopup(menuData.uid);
        }
        if (selectedItem?.action) {
          const actions = Array.isArray(selectedItem.action)
            ? selectedItem.action
            : [selectedItem.action];
          await performActions(actions);
        }
        if (behavior === MenuItemBehavior.CLOSE_AFTER_SELECT) {
          ui.closePopup(menuData.uid);
        }
        if (behavior !== MenuItemBehavior.NONE) {
          onDone();
        }
      }
    },
    [moveSelection, inControl, selectedItem, performActions, menuData, ui, onDone],
  );

  useEffect((): (() => void) | void => {
    if (inControl) {
      lock();
      const listener: ControlsListener = { onAction };
      controls.addListener(listener);
      return () => {
        controls.removeListener(listener);
        unlock();
      };
    }
  }, [onAction, lock, unlock, controls, inControl]);

  return { selectedItem };
}
