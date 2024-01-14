import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { ICamera } from "camera/ICamera";
import { IControls } from "controls/IControls";

interface Props {
  controls: IControls;
  camera: ICamera;
}

export class CamTiltResetAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly camera: ICamera;

  constructor(props: Props) {
    this.controls = props.controls;
    this.camera = props.camera;
    this._refresh = this._refresh.bind(this);
  }

  activate(): void | (() => void) {
    const removeListener = this.controls.addListener({
      onQuickTiltReset: () => {
        this.refresh = this._refresh;
        this.camera.tilt.angle.progressTowards(
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
    if (!this.camera.tilt.angle.update(deltaTime)) {
      this.refresh = undefined;
    }
  }
}
