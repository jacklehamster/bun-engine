import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IKeyboard } from "controls/IKeyboard";
import { ICamera } from "gl/camera/ICamera";

interface Props {
  keyboard: IKeyboard;
  camera: ICamera;
}

interface Config {
  speed: number;
}

export class CamMoveAuxiliary implements Auxiliary {
  private readonly keyboard: IKeyboard;
  private readonly camera: ICamera;
  private config: Config;

  constructor(props: Props, config?: Partial<Config>) {
    this.keyboard = props.keyboard;
    this.camera = props.camera;
    this.config = {
      speed: config?.speed ?? 1,
    };
  }

  refresh(update: UpdatePayload): void {
    const { keys } = this.keyboard;
    const { deltaTime } = update;
    const speed = deltaTime / 80 * this.config.speed;
    const turnspeed = deltaTime / 400;
    if (keys.KeyW || keys.ArrowUp && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, -speed);
    }
    if (keys.KeyS || keys.ArrowDown && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, speed);
    }
    if (keys.KeyA || (keys.ArrowLeft && !keys.ShiftRight)) {
      this.camera.moveCam(-speed, 0, 0);
    }
    if (keys.KeyD || (keys.ArrowRight && !keys.ShiftRight)) {
      this.camera.moveCam(speed, 0, 0);
    }
    if (keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight)) {
      this.camera.turnMatrix.turn -= turnspeed;
    }
    if (keys.KeyE || (keys.ArrowRight && keys.ShiftRight)) {
      this.camera.turnMatrix.turn += turnspeed;
    }
    if (keys.ArrowUp && keys.ShiftRight) {
      this.camera.tiltMatrix.tilt -= turnspeed;
    }
    if (keys.ArrowDown && keys.ShiftRight) {
      this.camera.tiltMatrix.tilt += turnspeed;
    }
  }
}
