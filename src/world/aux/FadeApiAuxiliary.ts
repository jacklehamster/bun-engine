import { ICamera } from "camera/ICamera";
import { IMotor } from "motor-loop";
import { Auxiliary } from "./Auxiliary";

interface Props {
  camera: ICamera;
  motor: IMotor;
  api: IFade;
}

interface Config {
  speed: number;
}

const FADE_RATE = .002;

export interface IFade {
  fadeOut?(): void;
  fadeIn?(): void;
}

export class FadeApiAuxiliary implements Auxiliary {
  private readonly camera: ICamera;
  private readonly config: Config;
  private readonly motor: IMotor;
  private readonly api: IFade;
  constructor({ camera, motor, api }: Props, config?: Partial<Config>) {
    this.camera = camera;
    this.motor = motor;
    this.api = api;
    this.config = {
      speed: config?.speed ?? 1,
    };
    this.fadeIn = this.fadeIn.bind(this);
    this.fadeOut = this.fadeOut.bind(this);
  }

  activate(): void {
    const api = this.api;
    api.fadeIn = this.fadeIn;
    api.fadeOut = this.fadeOut;
  }

  deactivate(): void {
    const api = this.api;
    if (api.fadeIn === this.fadeIn) {
      delete api.fadeIn;
    }
    if (api.fadeOut === this.fadeOut) {
      delete api.fadeOut;
    }
  }

  fadeOut() {
    this.camera.fade.progressTowards(1, this.config.speed * FADE_RATE, this, this.motor);
  }

  fadeIn() {
    this.camera.fade.progressTowards(0, this.config.speed * FADE_RATE, this, this.motor);
  }
}
