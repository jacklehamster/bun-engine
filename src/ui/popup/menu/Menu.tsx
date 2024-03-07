import { map } from 'abstract-list';
import { Popup } from '../base/Popup';
import { MenuData } from './MenuData';
import { UserInterface } from '../UserInterface';
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
    >
      {map(menuData.items, (item, index) => {
        const style = {
          color: selectedItem === item ? 'black' : 'white',
          backgroundColor: selectedItem === item ? 'white' : 'black',
        };
        return (
          <div key={index} style={style}>
            {item?.label}
          </div>
        );
      })}
    </Popup>
  );
}
