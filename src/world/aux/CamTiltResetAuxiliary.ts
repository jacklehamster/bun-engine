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
  private resetting: boolean = false;

  constructor(props: Props, config: Config) {
    this.keyboard = props.keyboard;
    this.camera = props.camera;
    this.key = config.key;
  }

  activate(): void | (() => void) {
    const removeListener = this.keyboard.addListener({
      onQuickTap: (keyCode) => {
        if (keyCode === this.key) {
          this.resetting = true;
          this.camera.tiltMatrix.progressive.setGoal(
            0, 1 / 300, this
          );
        }
      },
    });
    return () => removeListener();
  }

  refresh(update: UpdatePayload): void {
    if (this.resetting) {
      const { deltaTime } = update;
      if (!this.camera.tiltMatrix.progressive.update(deltaTime)) {
        this.resetting = false;
      }
    }
  }
}
