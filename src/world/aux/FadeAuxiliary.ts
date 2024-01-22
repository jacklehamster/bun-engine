import { ICamera } from "camera/ICamera";
import { IMotor } from "motor/IMotor";
import IWorld from "world/IWorld";
import { Auxiliary } from "./Auxiliary";

interface Props {
  camera: ICamera;
  motor: IMotor;
}

interface Config {
  speed: number;
}

const FADE_RATE = .002;

export interface IFade {
  fadeOut?(): void;
  fadeIn?(): void;
}

export class FadeAuxiliary implements Auxiliary<IWorld> {
  private readonly camera: ICamera;
  private readonly config: Config;
  private readonly motor: IMotor;
  private world?: IWorld<IFade>;
  constructor({ camera, motor }: Props, config?: Partial<Config>) {
    this.camera = camera;
    this.motor = motor;
    this.config = {
      speed: config?.speed ?? 1,
    };
    this.fadeIn = this.fadeIn.bind(this);
    this.fadeOut = this.fadeOut.bind(this);
  }

  set holder(world: IWorld) {
    this.world = world;
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
