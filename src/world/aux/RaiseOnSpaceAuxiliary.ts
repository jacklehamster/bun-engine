import { Keyboard } from "controls/Keyboard";
import { ActivateProps } from "core/Active";
import { Camera } from "gl/camera/Camera";
import { UpdatePayload } from "updates/Refresh";
import { Auxliary } from "./Auxiliary";

export class RaiseOnSpaceAuxiliary implements Auxliary {
  private keyboard?: Keyboard;

  constructor(private camera: Camera) {
  }
  activate({ core }: ActivateProps): () => void {
    this.keyboard = core.keyboard;
    const deregister = core.motor.loop(this);
    return () => {
      deregister();
    };
  }

  refresh(update: UpdatePayload): void {
    if (!this.keyboard) {
      return;
    }
    const { deltaTime } = update;

    this.spaceForRiseAndDrop(deltaTime, this.keyboard);
  }

  spaceForRiseAndDrop(deltaTime: number, keyboard: Keyboard): void {
    const speed = deltaTime / 80;
    const { keys, keysUp } = keyboard;
    if (keys.Space) {
      this.camera.moveCam(0, speed, 0);
    } else if (keysUp.Space) {
      this.camera.moveCam(0, -speed, 0);
      const [x, y, z] = this.camera.getPosition();
      if (y < 0) {
        this.camera.setPosition(x, 0, z);
        keysUp.Space = 0;
      }
    }
  }
}
