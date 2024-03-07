import { Popup } from 'ui/popup/Popup';
import { DialogData } from '../model/ui/DialogData';
import { useDialog } from './useDialog';
import { UserInterface } from 'ui/UserInterface';
import './text/ProgressiveText';

interface Props {
  dialogData: DialogData;
  ui: UserInterface;
  onDone(): void;
}

export function Dialog({ dialogData, ui, onDone }: Props): JSX.Element {
  const { text } = useDialog({ dialogData, ui, onDone });

  const position: [number, number] = [
    dialogData?.position?.[0] ?? 50,
    dialogData?.position?.[1] ?? 500,
  ];
  const size: [number | undefined, number | undefined] = [
    dialogData?.size?.[0],
    dialogData?.size?.[1],
  ];

  const { fontSize, positionFromRight, positionFromBottom } = dialogData;
  return (
    <Popup
      position={position}
      size={size}
      fontSize={fontSize}
      positionFromBottom={positionFromBottom}
      positionFromRight={positionFromRight}
    >
      <div style={{ padding: 10 }}>
        <progressive-text period="30">{text}</progressive-text>
      </div>
    </Popup>
  );
}
