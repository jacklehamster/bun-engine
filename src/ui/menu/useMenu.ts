import { UserInterface } from "ui/UserInterface";
import { MenuData } from "../model/ui/MenuData";
import { useSelection } from "./useSelection";
import { useActions } from "ui/actions/useActions";
import { useCallback } from "react";
import { IControls } from "controls/IControls";
import { MenuItem, MenuItemBehavior } from "../model/conversation/MenuItem";
import { useControlsLock } from "ui/controls/useControlsLock";

interface Props {
  menuData: MenuData;
  ui: UserInterface;
  onDone(): void;
}

interface Result {
  selectedItem?: MenuItem;
}

export function useMenu({ menuData, ui, onDone }: Props): Result {
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
        const selectedAction = selectedItem?.action;
        if (selectedAction) {
          const actions = Array.isArray(selectedAction) ? selectedAction : [selectedAction];
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
    [moveSelection, selectedItem, performActions, menuData, ui, onDone],
  );

  useControlsLock({ uid: menuData.uid, onAction });

  return { selectedItem };
}
