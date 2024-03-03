import { Popup } from 'ui/popup/Popup';
import { DialogData } from './model/DialogData';
import { useDialog } from './useDialog';
import './text/ProgressiveText';

interface Props {
  dialogData: DialogData;
}

export function Dialog({ dialogData }: Props): JSX.Element {
  const { text } = useDialog({ dialogData });

  const position: [number, number] = [
    dialogData?.position?.[0] ?? 50,
    dialogData?.position?.[1] ?? 500,
  ];
  const size: [number | undefined, number | undefined] = [
    dialogData?.size?.[0],
    dialogData?.size?.[1],
  ];

  return (
    dialogData && (
      <Popup
        position={position}
        size={size}
        fontSize={dialogData.fontSize}
        positionFromBottom={!!dialogData.positionFromBottom}
        positionFromRight={!!dialogData.positionFromRight}
        zIndex={dialogData.zIndex}
      >
        <div style={{ padding: 10 }}>
          <progressive-text period="30">{text}</progressive-text>
        </div>
      </Popup>
    )
  );
}
