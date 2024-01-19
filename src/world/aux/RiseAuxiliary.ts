import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { ControlsListener, IControls } from "controls/IControls";
import { PositionMatrix } from "gl/transform/PositionMatrix";

interface Props {
  controls: IControls;
  position: PositionMatrix;
}

export class RiseAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly position: PositionMatrix;

  constructor({ controls, position }: Props) {
    this.controls = controls;
    this.position = position;
  }

  activate(): void {
    const listener: ControlsListener = {
      onQuickAction: () => this.refresh = this._refresh,
      onAction: () => this.refresh = this._refresh,
    };
    this.controls.addListener(listener);
    this.deactivate = () => {
      this.controls.removeListener(listener);
      this.deactivate = undefined;
    };
  }

  deactivate?(): void;

  refresh?: ((updatePayload: UpdatePayload) => void) | undefined;

  _refresh(update: UpdatePayload): void {
    const { deltaTime } = update;

    this.riseAndDrop(deltaTime, this.controls);
  }

  riseAndDrop(deltaTime: number, controls: IControls): void {
    const speed = deltaTime / 80;
    const { action } = controls;
    if (action) {
      this.position.moveBy(0, speed, 0);
    } else {
      this.position.moveBy(0, -speed, 0);
      const [x, y, z] = this.position.position;
      if (y < 0) {
        this.position.moveTo(x, 0, z);
        this.refresh = undefined;
      }
    }
  }
}
