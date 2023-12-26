import { Keyboard } from "controls/Keyboard";
import { Camera } from "gl/camera/Camera";
import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { Core } from "core/Core";

export class RaiseOnSpaceAuxiliary implements Auxiliary {
  private readonly keyboard: Keyboard;
  private readonly camera: Camera;

  constructor(core: Core) {
    this.keyboard = core.keyboard;
    this.camera = core.camera;
  }

  refresh(update: UpdatePayload): void {
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
