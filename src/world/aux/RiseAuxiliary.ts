import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { ICamera } from "camera/ICamera";
import { IControls } from "controls/IControls";

interface Props {
  controls: IControls;
  camera: ICamera;
}

export class RiseAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly camera: ICamera;
  private dropping: boolean = false;

  constructor({ controls, camera }: Props) {
    this.controls = controls;
    this.camera = camera;
  }

  activate(): void {
    const removeListener = this.controls.addListener({
      onQuickAction: () => {
        this.dropping = true;
      },
    });
    this.deactivate = () => {
      removeListener();
      this.deactivate = undefined;
    };
  }

  deactivate?(): void;

  refresh(update: UpdatePayload): void {
    const { deltaTime } = update;

    this.riseAndDrop(deltaTime, this.controls);
  }

  riseAndDrop(deltaTime: number, controls: IControls): void {
    const speed = deltaTime / 80;
    const { action } = controls;
    if (action) {
      this.camera.moveCam(0, speed, 0);
    } else if (this.dropping) {
      this.camera.moveCam(0, -speed, 0);
      const [x, y, z] = this.camera.position.position;
      if (y < 0) {
        this.camera.position.moveTo(x, 0, z);
        this.dropping = false;
      }
    }
  }
}
