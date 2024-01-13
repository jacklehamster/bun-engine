import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { ICamera } from "camera/ICamera";
import { IControls } from "controls/IControls";

interface Props {
  controls: IControls;
  camera: ICamera;
}

interface Config {
  speed: number;
}

export class CamMoveAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly camera: ICamera;
  private config: Config;

  constructor(props: Props, config?: Partial<Config>) {
    this.controls = props.controls;
    this.camera = props.camera;
    this.config = {
      speed: config?.speed ?? 1,
    };
  }

  refresh(update: UpdatePayload): void {
    const { forward, backward, left, right, up, down, turnLeft, turnRight } = this.controls;
    const { deltaTime } = update;
    const speed = deltaTime / 80 * this.config.speed;
    const turnspeed = deltaTime / 400;
    if (forward) {
      this.camera.moveCam(0, 0, -speed);
    }
    if (backward) {
      this.camera.moveCam(0, 0, speed);
    }
    if (left) {
      this.camera.moveCam(-speed, 0, 0);
    }
    if (right) {
      this.camera.moveCam(speed, 0, 0);
    }
    if (turnLeft) {
      this.camera.turnMatrix.turn -= turnspeed;
    }
    if (turnRight) {
      this.camera.turnMatrix.turn += turnspeed;
    }
    if (up) {
      this.camera.tiltMatrix.tilt -= turnspeed;
    }
    if (down) {
      this.camera.tiltMatrix.tilt += turnspeed;
    }
  }
}
