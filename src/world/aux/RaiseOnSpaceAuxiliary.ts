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

export class RiseAuxiliary implements Auxiliary {
  private readonly keyboard: IKeyboard;
  private readonly camera: ICamera;
  private key: string;

  constructor({ keyboard, camera }: Props, config: Config = { key: "Space" }) {
    this.keyboard = keyboard;
    this.camera = camera;
    this.key = config.key;
  }

  refresh(update: UpdatePayload): void {
    const { deltaTime } = update;

    this.riseAndDrop(deltaTime, this.keyboard);
  }

  riseAndDrop(deltaTime: number, keyboard: IKeyboard): void {
    const speed = deltaTime / 80;
    const { keys, keysUp } = keyboard;
    if (keys[this.key]) {
      this.camera.moveCam(0, speed, 0);
    } else if (keysUp[this.key]) {
      this.camera.moveCam(0, -speed, 0);
      const [x, y, z] = this.camera.getPosition();
      if (y < 0) {
        this.camera.setPosition(x, 0, z);
        keysUp.Space = 0;
      }
    }
  }
}
