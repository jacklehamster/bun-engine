import { Popup } from '../popup/Popup';
import { map } from 'abstract-list';
import { MenuData } from '../model/ui/MenuData';
import { UserInterface } from 'ui/UserInterface';
import { useMenu } from './useMenu';

interface Props {
  menuData: MenuData;
  ui: UserInterface;
  onDone(): void;
}

export function Menu({ menuData, ui, onDone }: Props): JSX.Element {
  const { selectedItem } = useMenu({ menuData, ui, onDone });

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
