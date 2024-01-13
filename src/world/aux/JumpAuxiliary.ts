import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { ICamera } from "camera/ICamera";
import { IControls } from "controls/IControls";

interface Config {
  gravity: number;
  jump: number;
  plane: number;
}

interface Props {
  controls: IControls;
  camera: ICamera;
}

export class JumpAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly camera: ICamera;
  private gravity: number;
  private dy: number;
  private jumpStrength = 0;
  private plane = 1;

  constructor({ controls, camera }: Props, config: Partial<Config> = {}) {
    this.controls = controls;
    this.camera = camera;
    this.gravity = config.gravity ?? -1;
    this.jumpStrength = config.jump ?? 2;
    this.plane = config.plane ?? 10;
    this.dy = 0;
  }

  refresh(update: UpdatePayload): void {
    const { deltaTime } = update;
    this.jump(deltaTime, this.controls);
  }

  jump(deltaTime: number, controls: IControls): void {
    const speed = deltaTime / 80;
    const acceleration = deltaTime / 80;
    const { action } = controls;
    const [_x, y, _z] = this.camera.posMatrix.position;
    if (y === 0) {
      if (action) {
        this.dy = this.jumpStrength;
        this.camera.moveCam(0, speed * this.dy, 0);
      }
    } else {
      this.camera.moveCam(0, speed * this.dy, 0);
      const [x, y, z] = this.camera.posMatrix.position;
      if (y > 0) {
        const mul = this.dy < 0 ? 1 / this.plane : 1;
        this.dy += this.gravity * acceleration * mul;
      } else {
        this.camera.posMatrix.moveTo(x, 0, z);
        this.dy = 0;
      }
    }
  }
}
