import { IControls } from "./IControls";

export interface ControlsListener {
  onQuickAction?(): void;
  onQuickTiltReset?(): void;
  onAction?(controls: IControls): void;
  onActionUp?(controls: IControls): void;
}
