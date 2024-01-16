import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";

interface Props {
  controls: IControls;
  tilt: IAngleMatrix;
}

export class TiltResetAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly tilt: IAngleMatrix;

  constructor(props: Props) {
    this.controls = props.controls;
    this.tilt = props.tilt;
    this._refresh = this._refresh.bind(this);
  }

  activate(): void | (() => void) {
    const removeListener = this.controls.addListener({
      onQuickTiltReset: () => {
        this.refresh = this._refresh;
        this.tilt.angle.progressTowards(
          0, 1 / 300, this
        );
      },
    });
    this.deactivate = () => {
      removeListener();
      this.deactivate = undefined;
    };
  }

  deactivate?(): void;

  refresh?: ((updatePayload: UpdatePayload) => void) | undefined;

  _refresh(update: UpdatePayload): void {
    const { deltaTime } = update;
    if (!this.tilt.angle.update(deltaTime)) {
      this.refresh = undefined;
    }
  }
}
