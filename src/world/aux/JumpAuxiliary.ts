import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IKeyboard } from "controls/IKeyboard";
import { ICamera } from "gl/camera/ICamera";

interface Config {
  key: string;
  gravity: number;
  jump: number;
  plane: number;
}

interface Props {
  keyboard: IKeyboard;
  camera: ICamera;
}

export class JumpAuxiliary implements Auxiliary {
  private readonly keyboard: IKeyboard;
  private readonly camera: ICamera;
  private key: string;
  private gravity: number;
  private dy: number;
  private jumpStrength = 0;
  private plane = 1;

  constructor({ keyboard, camera }: Props, config: Partial<Config> = {}) {
    this.keyboard = keyboard;
    this.camera = camera;
    this.key = config.key ?? "Space";
    this.gravity = config.gravity ?? -1;
    this.jumpStrength = config.jump ?? 2;
    this.plane = config.plane ?? 10;
    this.dy = 0;
  }

  refresh(update: UpdatePayload): void {
    const { deltaTime } = update;

    this.jump(deltaTime, this.keyboard);
  }

  jump(deltaTime: number, keyboard: IKeyboard): void {
    const speed = deltaTime / 80;
    const acceleration = deltaTime / 80;
    const { keys } = keyboard;
    const [_x, y, _z] = this.camera.posMatrix.position;
    if (y === 0) {
      if (keys[this.key]) {
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
