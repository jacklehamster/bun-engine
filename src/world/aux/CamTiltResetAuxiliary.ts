import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IKeyboard } from "controls/IKeyboard";
import { ICamera } from "gl/camera/ICamera";

interface Props {
  keyboard: IKeyboard;
  camera: ICamera;
}

interface Config {
  key: string;
}

export class CamTiltResetAuxiliary implements Auxiliary {
  private readonly keyboard: IKeyboard;
  private readonly camera: ICamera;
  private key: string;

  constructor(props: Props, config: Config) {
    this.keyboard = props.keyboard;
    this.camera = props.camera;
    this.key = config.key;
    this._refresh = this._refresh.bind(this);
  }

  activate(): void | (() => void) {
    const removeListener = this.keyboard.addListener({
      onQuickTap: (keyCode) => {
        if (keyCode === this.key) {
          this.refresh = this._refresh;
          this.camera.tiltMatrix.progressive.setGoal(
            0, 1 / 300, this
          );
        }
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
    if (!this.camera.tiltMatrix.progressive.update(deltaTime)) {
      this.refresh = undefined;
    }
  }
}
