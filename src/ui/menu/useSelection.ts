import { useCallback, useEffect, useMemo, useState } from "react";
import { MenuData } from "../model/ui/MenuData";
import { useGameContext } from "ui/Provider";

interface Props {
  menuData: MenuData;
}

export function useSelection({ menuData }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { onSelection } = useGameContext();

  useEffect(() => {
    onSelection(selectedIndex);
  }, [selectedIndex, onSelection]);

  const select = useCallback((index: number) => {
    const len = menuData.items.length.valueOf();
    setSelectedIndex(index % len);
  }, [setSelectedIndex, menuData]);

  const moveSelection = useCallback((dy: number) => {
    if (dy) {
      const len = menuData.items.length.valueOf();
      setSelectedIndex(index => (index + dy + len) % len);
    }
  }, [setSelectedIndex, menuData]);

  const selectedItem = useMemo(() => {
    return menuData.items.at(selectedIndex);
  }, [menuData, selectedIndex]);

  return {
    select,
    moveSelection,
    selectedItem,
  }
}
