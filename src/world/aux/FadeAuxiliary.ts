import { ICamera } from "camera/ICamera";
import { IMotor } from "motor-loop";
import IWorld from "world/IWorld";
import { Auxiliary } from "./Auxiliary";

interface Props {
  camera: ICamera;
  motor: IMotor;
  world: IWorld<IFade>;
}

interface Config {
  speed: number;
}

const FADE_RATE = .002;

export interface IFade {
  fadeOut?(): void;
  fadeIn?(): void;
}

export class FadeAuxiliary implements Auxiliary {
  private readonly camera: ICamera;
  private readonly config: Config;
  private readonly motor: IMotor;
  private readonly world: IWorld<IFade>;
  constructor({ camera, motor, world }: Props, config?: Partial<Config>) {
    this.camera = camera;
    this.motor = motor;
    this.world = world;
    this.config = {
      speed: config?.speed ?? 1,
    };
    this.fadeIn = this.fadeIn.bind(this);
    this.fadeOut = this.fadeOut.bind(this);
  }

  activate(): void {
    const api = this.world?.api;
    if (api) {
      api.fadeIn = this.fadeIn;
      api.fadeOut = this.fadeOut;
    }
  }

  deactivate(): void {
    const api = this.world?.api;
    if (api) {
      if (api.fadeIn === this.fadeIn) {
        delete api.fadeIn;
      }
      if (api.fadeOut === this.fadeOut) {
        delete api.fadeOut;
      }
    }
  }

  fadeOut() {
    this.camera.fade.progressTowards(1, this.config.speed * FADE_RATE, this, this.motor);
  }

  fadeIn() {
    this.camera.fade.progressTowards(0, this.config.speed * FADE_RATE, this, this.motor);
  }
}
